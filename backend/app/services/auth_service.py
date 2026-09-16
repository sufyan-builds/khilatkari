from app.database import get_admins_collection
from app.utils.security import verify_password, hash_password
from app.config import settings


async def authenticate_admin(username: str, password: str) -> bool:
    """Check username/password against DB. Falls back to env var config."""
    col = get_admins_collection()
    admin = await col.find_one({"username": username})

    if admin:
        return verify_password(password, admin["passwordHash"])

    # Fallback: compare with env-configured admin (for first login before seeding)
    if username == settings.admin_username and settings.admin_password_hash:
        return verify_password(password, settings.admin_password_hash)

    return False


async def ensure_admin_exists():
    """Create admin document in DB if it doesn't exist."""
    col = get_admins_collection()
    existing = await col.find_one({"username": settings.admin_username})
    if not existing and settings.admin_password_hash:
        await col.insert_one({
            "username": settings.admin_username,
            "passwordHash": settings.admin_password_hash,
        })
