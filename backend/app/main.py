from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_indexes
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from app.routes import products, appointments
from app.routes.admin import auth, products as admin_products, appointments as admin_appointments, stats, upload as admin_upload

# Uploads directory on disk
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        await create_indexes()
    except Exception as e:
        print(f"Notice: Index setup deferred: {e}")
    yield
    # Shutdown (Motor client cleanup is automatic)


app = FastAPI(
    title="MS Fashions API",
    description="Backend API for MS Fashions luxury fashion boutique",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend to reach backend securely
allowed_origins = set()
if settings.frontend_url:
    for url in settings.frontend_url.split(","):
        cleaned = url.strip().rstrip("/")
        if cleaned:
            allowed_origins.add(cleaned)
# Always allow local dev origins
allowed_origins.update(["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Public routes
app.include_router(products.router)
app.include_router(appointments.router)

# Admin routes
app.include_router(auth.router)
app.include_router(admin_products.router)
app.include_router(admin_appointments.router)
app.include_router(stats.router)
app.include_router(admin_upload.router)


@app.get("/api/health")
async def health():
    return {"success": True, "message": "MS Fashions API is running"}
