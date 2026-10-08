import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import create_indexes
from app.routes import products, appointments, homepage, categories
from app.routes.admin import (
    auth,
    products as admin_products,
    appointments as admin_appointments,
    stats,
    upload as admin_upload,
    homepage as admin_homepage,
    categories as admin_categories,
)
from app.services import category_service
from app.utils.logging_sanitizer import sanitize_log_message, SecretScrubbingFilter

# Configure logging with secret scrubbing filter
logging.basicConfig(level=logging.INFO)
root_logger = logging.getLogger()
root_logger.addFilter(SecretScrubbingFilter())
logger = logging.getLogger(__name__)

# Uploads directory on disk
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await create_indexes()
        await category_service.ensure_baseline_categories()
    except Exception as e:
        logger.warning("Startup setup deferred: %s", sanitize_log_message(str(e)))
    yield
    # Shutdown (Motor client cleanup is automatic)


app = FastAPI(
    title="MS Fashions API",
    description="Backend API for MS Fashions luxury fashion boutique",
    version="1.0.0",
    lifespan=lifespan,
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Security headers middleware:
    - X-Content-Type-Options: Prevents MIME-sniffing
    - X-Frame-Options: Prevents clickjacking
    - Referrer-Policy: Protects referrer leakage on external navigation
    - X-XSS-Protection: 0 (Modern standard, avoids buggy legacy audit heuristics)
    - Strict-Transport-Security: Enforced exclusively on confirmed HTTPS traffic in production

    Note on Content-Security-Policy (CSP):
    A rigid default CSP on API endpoints provides no protection to API consumers and risks
    breaking frontend dynamic resources (e.g., Google Fonts, external CDN images, React hydration)
    if served indiscriminately. CSP must be configured at the frontend hosting/reverse-proxy layer
    (Nginx / Cloudflare) where the SPA HTML document is served.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-XSS-Protection"] = "0"

    # Strict-Transport-Security ONLY applied to confirmed HTTPS traffic in production
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    if is_https and settings.environment.lower() == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


# Centralized error handling: generic 500s, preserved 4xx validation messages
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "data": None},
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def custom_validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error in request parameters", "data": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled internal server error on %s %s: %s",
        request.method,
        request.url.path,
        sanitize_log_message(str(exc)),
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again later.",
            "data": None,
        },
    )


DEFAULT_PRODUCTION_ORIGINS = [
    "https://ms-fashion-closet.vercel.app",
]

# Regex matching any Vercel domain (*.vercel.app) for preview and production deployments
VERCEL_ORIGIN_REGEX = r"^https://([a-zA-Z0-9-]+\.)*vercel\.app$"


def get_allowed_cors_origins(environment: str = "development", frontend_url: str = "") -> list[str]:
    """
    Build allowed CORS origins.
    Permits configured frontend URLs, production defaults, and development localhost ports.
    """
    origins = set()
    if frontend_url:
        for url in frontend_url.split(","):
            cleaned = url.strip().rstrip("/")
            if cleaned:
                origins.add(cleaned)

    # Always ensure known production frontend origins are included
    origins.update(DEFAULT_PRODUCTION_ORIGINS)

    # Localhost and 127.0.0.1 origins are permitted in non-production environments
    if str(environment).strip().lower() != "production":
        origins.update([
            "http://localhost:5173",
            "http://localhost:4173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:4173",
        ])

    return sorted(list(origins))


allowed_origins = get_allowed_cors_origins(
    environment=settings.environment,
    frontend_url=settings.frontend_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=VERCEL_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media statically
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Public routes
app.include_router(products.router)
app.include_router(appointments.router)
app.include_router(homepage.router)
app.include_router(categories.router)

# Admin routes
app.include_router(auth.router)
app.include_router(admin_products.router)
app.include_router(admin_categories.router)
app.include_router(admin_appointments.router)
app.include_router(stats.router)
app.include_router(admin_upload.router)
app.include_router(admin_homepage.router)


@app.get("/api/health")
async def health():
    return {"success": True, "message": "MS Fashions API is running"}
