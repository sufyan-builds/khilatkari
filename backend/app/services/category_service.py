import re
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_categories_collection, get_products_collection, get_appointments_collection
from app.schemas.category import CategoryCreate, CategoryUpdate


DEFAULT_BASELINE_CATEGORIES = [
    {
        "name": "Chikankari",
        "slug": "chikankari",
        "coverImage": "/images/models/model-1.jpg",
        "description": "Delicate thread embroidery on chiffon",
        "homepageDescription": "Delicate thread embroidery on chiffon",
        "imagePosition": {"zoom": 1.0, "posX": 50.0, "posY": 0.0},
        "featuredOnHomepage": True,
        "homepageOrder": 1,
        "displayOrder": 1,
        "isActive": True,
    },
    {
        "name": "Kamdani",
        "slug": "kamdani",
        "coverImage": "/images/models/model-4.jpg",
        "description": "Shimmering metal thread work",
        "homepageDescription": "Shimmering metal thread work",
        "imagePosition": {"zoom": 1.0, "posX": 50.0, "posY": 0.0},
        "featuredOnHomepage": True,
        "homepageOrder": 2,
        "displayOrder": 2,
        "isActive": True,
    },
    {
        "name": "Gota & Mukesh",
        "slug": "gota-mukesh",
        "coverImage": "/images/models/model-6.jpg",
        "description": "Ornate gold ribbon embellishment",
        "homepageDescription": "Ornate gold ribbon embellishment",
        "imagePosition": {"zoom": 1.0, "posX": 50.0, "posY": 0.0},
        "featuredOnHomepage": True,
        "homepageOrder": 3,
        "displayOrder": 3,
        "isActive": True,
    },
    {
        "name": "Kashmiri Shawls",
        "slug": "kashmiri-shawls",
        "coverImage": "/images/models/model-7.jpg",
        "description": "Authentic Pashmina craftsmanship",
        "homepageDescription": "Authentic Pashmina craftsmanship",
        "imagePosition": {"zoom": 1.0, "posX": 50.0, "posY": 0.0},
        "featuredOnHomepage": True,
        "homepageOrder": 4,
        "displayOrder": 4,
        "isActive": True,
    },
    {
        "name": "Bridal Wear",
        "slug": "bridal-wear",
        "coverImage": "/images/models/model-9.jpg",
        "description": "Bespoke bridal ensembles",
        "homepageDescription": "Bespoke bridal ensembles",
        "imagePosition": {"zoom": 1.0, "posX": 50.0, "posY": 0.0},
        "featuredOnHomepage": True,
        "homepageOrder": 5,
        "displayOrder": 5,
        "isActive": True,
    },
    {
        "name": "Traditional Wear",
        "slug": "traditional-wear",
        "coverImage": "/images/models/model-10.jpg",
        "description": "Classic South Asian silhouettes and timeless needlework",
        "homepageDescription": "Classic South Asian silhouettes and timeless needlework",
        "imagePosition": {"zoom": 1.0, "posX": 50.0, "posY": 0.0},
        "featuredOnHomepage": False,
        "homepageOrder": 6,
        "displayOrder": 6,
        "isActive": True,
    },
]


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def doc_to_dict(doc: dict) -> dict:
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    if "isActive" not in doc:
        doc["isActive"] = True
    if "featuredOnHomepage" not in doc:
        doc["featuredOnHomepage"] = False
    if "displayOrder" not in doc:
        doc["displayOrder"] = 0
    if "homepageOrder" not in doc:
        doc["homepageOrder"] = 0
    if "productCount" not in doc:
        doc["productCount"] = 0
    if "imagePosition" not in doc or doc["imagePosition"] is None:
        doc["imagePosition"] = {"zoom": 1.0, "posX": 50.0, "posY": 0.0}
    return doc


async def ensure_baseline_categories():
    """Seed the 6 baseline categories if categories collection is empty."""
    col = get_categories_collection()
    count = await col.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        docs = []
        for cat in DEFAULT_BASELINE_CATEGORIES:
            doc = {
                **cat,
                "createdAt": now,
                "updatedAt": now,
            }
            docs.append(doc)
        if docs:
            await col.insert_many(docs)


async def get_all_categories(
    active_only: bool = False,
    featured_homepage_only: bool = False,
) -> List[dict]:
    await ensure_baseline_categories()
    col = get_categories_collection()
    prod_col = get_products_collection()

    query: Dict[str, Any] = {}
    if active_only:
        query["isActive"] = True
    if featured_homepage_only:
        query["featuredOnHomepage"] = True
        query["isActive"] = True

    sort_field = "homepageOrder" if featured_homepage_only else "displayOrder"
    cursor = col.find(query).sort([(sort_field, 1), ("name", 1)])
    categories = [doc_to_dict(doc) async for doc in cursor]

    # Dynamically compute product counts
    for cat in categories:
        cnt = await prod_col.count_documents({"category": cat["name"]})
        cat["productCount"] = cnt

    return categories


async def get_category_by_id(cat_id: str) -> Optional[dict]:
    col = get_categories_collection()
    prod_col = get_products_collection()
    try:
        doc = await col.find_one({"_id": ObjectId(cat_id)})
        if not doc:
            return None
        res = doc_to_dict(doc)
        res["productCount"] = await prod_col.count_documents({"category": res["name"]})
        return res
    except Exception:
        return None


async def get_category_by_slug_or_name(key: str) -> Optional[dict]:
    col = get_categories_collection()
    clean_key = key.strip()
    doc = await col.find_one({
        "$or": [
            {"slug": clean_key.lower()},
            {"name": {"$regex": f"^{re.escape(clean_key)}$", "$options": "i"}}
        ]
    })
    return doc_to_dict(doc) if doc else None


async def create_category(data: CategoryCreate) -> dict:
    col = get_categories_collection()
    now = datetime.now(timezone.utc)

    # Validate name uniqueness
    existing_name = await col.find_one({"name": {"$regex": f"^{re.escape(data.name.strip())}$", "$options": "i"}})
    if existing_name:
        raise ValueError(f"Category with name '{data.name}' already exists.")

    slug = data.slug or slugify(data.name)
    slug = slugify(slug)
    base_slug = slug
    counter = 1
    while await col.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    doc = {
        **data.model_dump(exclude={"slug"}),
        "name": data.name.strip(),
        "slug": slug,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await col.insert_one(doc)
    return await get_category_by_id(str(result.inserted_id))


async def update_category(cat_id: str, data: CategoryUpdate) -> Optional[dict]:
    col = get_categories_collection()
    prod_col = get_products_collection()
    appt_col = get_appointments_collection()

    existing = await col.find_one({"_id": ObjectId(cat_id)})
    if not existing:
        return None

    old_name = existing["name"]
    updates = {k: v for k, v in data.model_dump().items() if v is not None}

    # If name changed, ensure unique & cascade to products & appointments
    if "name" in updates and updates["name"].strip() != old_name:
        new_name = updates["name"].strip()
        duplicate = await col.find_one({
            "_id": {"$ne": ObjectId(cat_id)},
            "name": {"$regex": f"^{re.escape(new_name)}$", "$options": "i"}
        })
        if duplicate:
            raise ValueError(f"Another category with name '{new_name}' already exists.")
        updates["name"] = new_name

        # Cascade update existing products
        await prod_col.update_many(
            {"category": old_name},
            {"$set": {"category": new_name, "updatedAt": datetime.now(timezone.utc)}}
        )
        # Cascade update appointments with this collection name
        await appt_col.update_many(
            {"collection": old_name},
            {"$set": {"collection": new_name, "updatedAt": datetime.now(timezone.utc)}}
        )

    # If slug changed, ensure unique
    if "slug" in updates and updates["slug"]:
        new_slug = slugify(updates["slug"])
        duplicate_slug = await col.find_one({
            "_id": {"$ne": ObjectId(cat_id)},
            "slug": new_slug
        })
        if duplicate_slug:
            raise ValueError(f"Another category with slug '{new_slug}' already exists.")
        updates["slug"] = new_slug

    updates["updatedAt"] = datetime.now(timezone.utc)
    await col.update_one({"_id": ObjectId(cat_id)}, {"$set": updates})
    return await get_category_by_id(cat_id)


async def delete_category(cat_id: str) -> bool:
    col = get_categories_collection()
    prod_col = get_products_collection()

    existing = await col.find_one({"_id": ObjectId(cat_id)})
    if not existing:
        return False

    cat_name = existing["name"]
    assigned_count = await prod_col.count_documents({"category": cat_name})
    if assigned_count > 0:
        raise ValueError(
            f"Cannot delete category '{cat_name}' because {assigned_count} product(s) are currently assigned to it. "
            "Please reassign those products to another category first, or set this category to Hidden/Archived."
        )

    res = await col.delete_one({"_id": ObjectId(cat_id)})
    return res.deleted_count == 1


async def reassign_category_products(source_name: str, target_name: str) -> int:
    prod_col = get_products_collection()
    if source_name == target_name:
        return 0

    now = datetime.now(timezone.utc)
    result = await prod_col.update_many(
        {"category": source_name},
        {"$set": {"category": target_name, "updatedAt": now}}
    )
    return result.modified_count
