"""
In-Memory Sliding-Window Rate Limiter for KhilatKari API.

Architecture Note & Deployment Characteristics:
----------------------------------------------
1. Scope & Storage:
   - This rate limiter is strictly in-memory and process-local.
   - It is designed for single-instance / single-process deployments (current setup).
   - It maintains a sliding timestamp log per client IP in a Python deque.

2. Known Limitations & State Lifecycle:
   - Process Restarts: The in-memory budget resets whenever the backend server process
     restarts, redeploys, or crashes.
   - Multi-Worker / Multi-Instance Deployments: If deployed across multiple Uvicorn worker
     processes or horizontally scaled across multiple containers/instances behind a load
     balancer without sticky sessions, each worker will maintain its own isolated rate-limit
     state. A client's requests distributed across N instances effectively receive N times the
     budget.
   - Future Scaling Recommendation: For distributed multi-instance horizontal scaling,
     migrate the sliding-window state to a centralized low-latency store such as Redis
     (e.g., Redis sorted sets or token bucket scripts).

3. Anti-Spoofing Client IP Extraction:
   - Blindly trusting the 'X-Forwarded-For' header is dangerous because any untrusted
     remote client can inject an arbitrary IP address to bypass limits or frame another IP.
   - Therefore, direct TCP client host (request.client.host) is used as the default client IP.
   - The 'X-Forwarded-For' header is ONLY parsed if the immediate TCP socket peer is an
     explicitly trusted local reverse proxy (e.g., 127.0.0.1, ::1, localhost, or testclient).
   - When trusted, the leftmost IP in the forwarded chain is extracted as the originating client.
"""

import time
import asyncio
from collections import defaultdict, deque
from typing import Deque, Dict
from fastapi import Request, HTTPException, status


def extract_client_ip(request: Request) -> str:
    """
    Safely extract client IP with anti-spoofing controls.
    Only respects X-Forwarded-For if the immediate connection originates
    from a trusted local reverse proxy.
    """
    direct_ip = request.client.host if request.client else "unknown"

    # Only trust forwarded headers if the immediate socket peer is a local proxy
    trusted_proxy_peers = {"127.0.0.1", "::1", "localhost", "testclient"}
    if direct_ip in trusted_proxy_peers:
        forwarded = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
        if forwarded:
            first_ip = forwarded.split(",")[0].strip()
            if first_ip:
                return first_ip

    return direct_ip


class SlidingWindowRateLimiter:
    """
    Sliding-window rate limiter tracking request timestamps within a rolling window.
    Process-local, in-memory implementation for single-instance service.
    """

    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # Mapping from client_ip -> deque of float timestamps
        self.history: Dict[str, Deque[float]] = defaultdict(deque)
        self.lock = asyncio.Lock()

    async def check(self, request: Request) -> bool:
        """
        Check if the request is permitted within the current sliding window.
        Returns True if allowed (and logs timestamp), False if limit is exceeded.
        """
        now = time.time()
        client_ip = extract_client_ip(request)

        async with self.lock:
            timestamps = self.history[client_ip]

            # Evict timestamps older than current sliding window cutoff
            cutoff = now - self.window_seconds
            while timestamps and timestamps[0] < cutoff:
                timestamps.popleft()

            if len(timestamps) >= self.requests_limit:
                return False

            timestamps.append(now)

            # Prune idle IP records periodically if hash table grows large
            if len(self.history) > 10000:
                self._prune_idle_clients(cutoff)

            return True

    async def __call__(self, request: Request):
        """
        FastAPI dependency callable. Enforces rate limit and raises HTTP 429
        with generic message if limit is exceeded.
        """
        now = time.time()
        client_ip = extract_client_ip(request)

        async with self.lock:
            timestamps = self.history[client_ip]

            # Evict expired entries
            cutoff = now - self.window_seconds
            while timestamps and timestamps[0] < cutoff:
                timestamps.popleft()

            if len(timestamps) >= self.requests_limit:
                retry_after = int(self.window_seconds - (now - timestamps[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Please try again later.",
                    headers={"Retry-After": str(max(1, retry_after))},
                )

            timestamps.append(now)

            if len(self.history) > 10000:
                self._prune_idle_clients(cutoff)

    def _prune_idle_clients(self, cutoff: float):
        idle_keys = [ip for ip, dq in self.history.items() if not dq or dq[-1] < cutoff]
        for ip in idle_keys:
            del self.history[ip]
