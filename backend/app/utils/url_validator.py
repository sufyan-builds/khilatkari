import re
from typing import Optional
from urllib.parse import urlparse

DANGEROUS_SCHEMES = {"javascript", "data", "vbscript", "file"}


def validate_media_url(url: Optional[str]) -> Optional[str]:
    """Validate media URLs (images, videos, posters).
    Allows relative paths (/uploads/..., uploads/..., /images/...) and safe http/https schemes.
    Blocks dangerous schemes like javascript:, data:, vbscript:, file:.
    """
    if not url:
        return url
    trimmed = str(url).strip()
    if not trimmed:
        return trimmed

    lower = trimmed.lower()
    clean_check = re.sub(r"[\s\x00-\x1f]", "", lower)
    for scheme in DANGEROUS_SCHEMES:
        if clean_check.startswith(f"{scheme}:") or clean_check.startswith(f"{scheme}&#"):
            raise ValueError(f"Dangerous URL scheme '{scheme}:' is not allowed.")

    parsed = urlparse(trimmed)
    if parsed.scheme:
        if parsed.scheme.lower() not in {"http", "https"}:
            raise ValueError(f"Invalid media URL scheme '{parsed.scheme}'. Only HTTP, HTTPS, or relative paths are permitted.")
    return trimmed


def validate_link_url(url: Optional[str]) -> Optional[str]:
    """Validate action and navigation links (CTA buttons, links).
    Allows relative paths (/appointments, #philosophy), http/https, and safe contact schemes (tel:, mailto:, whatsapp:).
    Blocks dangerous schemes like javascript:, data:, vbscript:.
    """
    if not url:
        return url
    trimmed = str(url).strip()
    if not trimmed:
        return trimmed

    lower = trimmed.lower()
    clean_check = re.sub(r"[\s\x00-\x1f]", "", lower)
    for scheme in DANGEROUS_SCHEMES:
        if clean_check.startswith(f"{scheme}:") or clean_check.startswith(f"{scheme}&#"):
            raise ValueError(f"Dangerous URL scheme '{scheme}:' is not allowed.")

    parsed = urlparse(trimmed)
    if parsed.scheme:
        allowed_schemes = {"http", "https", "tel", "mailto", "whatsapp"}
        if parsed.scheme.lower() not in allowed_schemes:
            raise ValueError(f"Disallowed URL scheme '{parsed.scheme}'. Allowed schemes: http, https, tel, mailto, whatsapp, or relative paths.")
    return trimmed
