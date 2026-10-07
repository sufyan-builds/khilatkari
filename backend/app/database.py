import os
import certifi
import motor.motor_asyncio
from app.config import settings

def build_mongo_kwargs(environment: str = "development", tls_allow_invalid: bool | str = False) -> dict:
    is_prod = str(environment).strip().lower() == "production"
    kwargs = {
        "tls": True,
        "tlsCAFile": certifi.where(),
        "serverSelectionTimeoutMS": 10000,
        "connectTimeoutMS": 10000,
    }
    # For local development compatibility on some OS/Python environments, allow invalid certs
    # only when NOT in production. Whenever ENVIRONMENT=production, this is forcibly ignored.
    allow_invalid = (
        str(tls_allow_invalid).strip().lower() in ("true", "1", "yes")
        if isinstance(tls_allow_invalid, (str, int))
        else bool(tls_allow_invalid)
    )
    if not is_prod and allow_invalid:
        kwargs["tlsAllowInvalidCertificates"] = True
    else:
        kwargs["tlsAllowInvalidCertificates"] = False
    return kwargs


get_database_options = build_mongo_kwargs


mongo_kwargs = build_mongo_kwargs(
    environment=settings.environment,
    tls_allow_invalid=settings.tls_allow_invalid_certs or os.getenv("TLS_ALLOW_INVALID_CERTS", "false")
)

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


def get_homepage_collection():
    return db["homepage_content"]


def get_categories_collection():
    return db["categories"]


async def create_indexes():
    """Create MongoDB indexes for performance."""
    products = get_products_collection()
    await products.create_index("slug", unique=True)
    await products.create_index("category")
    await products.create_index("featured")
    await products.create_index("available")

    categories = get_categories_collection()
    await categories.create_index("slug", unique=True)
    await categories.create_index("name", unique=True)
    await categories.create_index("displayOrder")
    await categories.create_index("featuredOnHomepage")

    appointments = get_appointments_collection()
    await appointments.create_index("status")
    await appointments.create_index("city")
    await appointments.create_index("createdAt")

    admins = get_admins_collection()
    await admins.create_index("username", unique=True)
