"""
Seed script — run ONCE to populate the database with sample products and create the admin.

Usage (from backend/ directory):
    python seed.py

This will:
1. Hash and store the admin password
2. Insert sample products with real model image URLs

Run with: python seed.py
"""
import asyncio
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings
from app.database import get_products_collection, get_admins_collection
from app.utils.security import hash_password

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")


SAMPLE_PRODUCTS = [
    {
        "name": "Ivory Chikankari Chiffon Suit",
        "slug": "ivory-chikankari-chiffon-suit",
        "category": "Chikankari",
        "description": "A breathtaking ivory chiffon suit adorned with intricate Chikankari embroidery. Perfect for formal gatherings and evening events.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Premium Chiffon",
        "craftsmanship": "Hand-crafted Chikankari embroidery",
        "color": "Ivory White",
        "sizes": ["Free Size", "Custom Stitching Available"],
        "images": ["/images/models/model-1.jpg", "/images/models/model-2.jpg"],
        "featured": True,
        "available": True,
    },
    {
        "name": "Blush Kamdani Gharara Set",
        "slug": "blush-kamdani-gharara-set",
        "category": "Kamdani",
        "description": "Elegantly crafted blush gharara set with delicate Kamdani work. A statement piece for celebrations and formal events.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Pure Organza",
        "craftsmanship": "Kamdani metal thread embroidery",
        "color": "Blush Pink",
        "sizes": ["Free Size", "Custom Stitching Available"],
        "images": ["/images/models/model-3.jpg", "/images/models/model-4.jpg"],
        "featured": True,
        "available": True,
    },
    {
        "name": "Gold Gota & Mukesh Lehenga",
        "slug": "gold-gota-mukesh-lehenga",
        "category": "Gota & Mukesh",
        "description": "Resplendent gold lehenga featuring traditional Gota Patti and Mukesh mirror work. Exudes royalty and grace.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Silk Tissue",
        "craftsmanship": "Gota Patti and Mukesh mirror embellishment",
        "color": "Royal Gold",
        "sizes": ["Free Size", "Custom Stitching Available"],
        "images": ["/images/models/model-5.jpg", "/images/models/model-6.jpg"],
        "featured": True,
        "available": True,
    },
    {
        "name": "Pashmina Kashmiri Shawl",
        "slug": "pashmina-kashmiri-shawl",
        "category": "Kashmiri Shawls",
        "description": "Authentic Pashmina shawl with traditional Kashmiri paisley hand-embroidery. Warmth meets timeless elegance.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Pure Pashmina",
        "craftsmanship": "Hand-embroidered Kashmiri Kani weave",
        "color": "Deep Burgundy",
        "sizes": ["One Size"],
        "images": ["/images/models/model-7.jpg", "/images/models/model-8.jpg"],
        "featured": True,
        "available": True,
    },
    {
        "name": "Pearl Bridal Lehenga Choli",
        "slug": "pearl-bridal-lehenga-choli",
        "category": "Bridal Wear",
        "description": "The ultimate bridal ensemble — pearl-encrusted lehenga choli with full hand-embroidery. A dream for the modern bride.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Raw Silk with Net Dupatta",
        "craftsmanship": "Full hand-embroidery with pearls and sequins",
        "color": "Off-White and Silver",
        "sizes": ["Custom Stitching Only"],
        "images": ["/images/models/model-9.jpg", "/images/models/model-10.jpg"],
        "featured": True,
        "available": True,
    },
    {
        "name": "Emerald Traditional Anarkali",
        "slug": "emerald-traditional-anarkali",
        "category": "Traditional Wear",
        "description": "Floor-length emerald Anarkali with intricate border embroidery. Timeless silhouette for formal occasions.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Georgette",
        "craftsmanship": "Zardozi border embroidery",
        "color": "Emerald Green",
        "sizes": ["Free Size", "Custom Stitching Available"],
        "images": ["/images/models/model-11.jpg", "/images/models/model-12.jpg"],
        "featured": False,
        "available": True,
    },
    {
        "name": "Champagne Chikankari Sharara",
        "slug": "champagne-chikankari-sharara",
        "category": "Chikankari",
        "description": "Flowing champagne sharara with all-over Chikankari embroidery on pure chiffon. Effortlessly elegant.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Pure Chiffon",
        "craftsmanship": "All-over Chikankari embroidery",
        "color": "Champagne",
        "sizes": ["Free Size", "Custom Stitching Available"],
        "images": ["/images/models/model-13.jpg", "/images/models/model-14.jpg"],
        "featured": False,
        "available": True,
    },
    {
        "name": "Rose Kamdani Peplum Set",
        "slug": "rose-kamdani-peplum-set",
        "category": "Kamdani",
        "description": "Contemporary peplum kurta with salwar and dupatta, embellished with delicate Kamdani work throughout.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Organza with Cotton Lining",
        "craftsmanship": "Fine Kamdani metal thread work",
        "color": "Dusty Rose",
        "sizes": ["Free Size", "Custom Stitching Available"],
        "images": ["/images/models/model-15.jpg", "/images/models/model-16.jpg"],
        "featured": False,
        "available": True,
    },
    {
        "name": "Crimson Bridal Sharara",
        "slug": "crimson-bridal-sharara",
        "category": "Bridal Wear",
        "description": "Magnificent crimson bridal sharara with heavy Zardozi and stone work. A celebration of Pakistani bridal tradition.",
        "price": None,
        "priceDisplayMode": "price_on_request",
        "fabric": "Velvet with Chiffon Dupatta",
        "craftsmanship": "Heavy Zardozi and stone embellishment",
        "color": "Crimson Red",
        "sizes": ["Custom Stitching Only"],
        "images": ["/images/models/model-17.jpg", "/images/models/model-18.jpg"],
        "featured": False,
        "available": True,
    },
]


async def seed():
    print("🌱 Starting database seed...")

    # 1. Create admin
    admin_col = get_admins_collection()
    existing_admin = await admin_col.find_one({"username": settings.admin_username})
    if existing_admin:
        print(f"✅ Admin '{settings.admin_username}' already exists, skipping.")
    else:
        seed_pw = os.getenv("ADMIN_DEFAULT_PASSWORD")
        if not seed_pw:
            raise ValueError("ADMIN_DEFAULT_PASSWORD environment variable must be set to create admin.")
        hashed = hash_password(seed_pw)
        await admin_col.insert_one({
            "username": settings.admin_username,
            "passwordHash": hashed,
            "createdAt": datetime.now(timezone.utc),
        })
        # Update .env with hash
        print(f"✅ Admin '{settings.admin_username}' created.")
        print(f"   Password hash: {hashed}")
        print("   → Update ADMIN_PASSWORD_HASH in your .env with the above hash.")

    # 2. Seed products
    products_col = get_products_collection()
    existing_count = await products_col.count_documents({})
    if existing_count > 0:
        print(f"✅ {existing_count} products already exist, skipping product seed.")
    else:
        now = datetime.now(timezone.utc)
        for p in SAMPLE_PRODUCTS:
            p["createdAt"] = now
            p["updatedAt"] = now
        result = await products_col.insert_many(SAMPLE_PRODUCTS)
        print(f"✅ Inserted {len(result.inserted_ids)} sample products.")

    print("\n✨ Database seeded successfully!")
    print(f"   Admin username: {settings.admin_username}")
    print("   Admin password: (configured via environment)")
    print("   Access admin at: http://localhost:5173/admin/login")


if __name__ == "__main__":
    asyncio.run(seed())
