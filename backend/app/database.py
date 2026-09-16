import os
import certifi
import motor.motor_asyncio
from app.config import settings

# Production MongoDB connections validate TLS certificates normally using certifi
mongo_kwargs = {
    "tls": True,
    "tlsCAFile": certifi.where(),
}

# Only allow invalid certificates if explicitly forced via environment variable
if os.getenv("TLS_ALLOW_INVALID_CERTS", "false").lower() == "true":
    mongo_kwargs["tlsAllowInvalidCertificates"] = True

# Create a single Motor client for the entire app lifetime
client = motor.motor_asyncio.AsyncIOMotorClient(
    settings.mongodb_uri,
    **mongo_kwargs
)
db = client[settings.database_name]


def get_products_collection():
    return db["products"]


def get_appointments_collection():
    return db["appointments"]


def get_admins_collection():
    return db["admins"]


async def create_indexes():
    """Create MongoDB indexes for performance."""
    products = get_products_collection()
    await products.create_index("slug", unique=True)
    await products.create_index("category")
    await products.create_index("featured")
    await products.create_index("available")

    appointments = get_appointments_collection()
    await appointments.create_index("status")
    await appointments.create_index("city")
    await appointments.create_index("createdAt")

    admins = get_admins_collection()
    await admins.create_index("username", unique=True)
