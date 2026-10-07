import re
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_products_collection, get_categories_collection
from app.schemas.product import ProductCreate, ProductUpdate


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return re.sub(r"^-+|-+$", "", text)


def doc_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a plain dict with string id."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    if not doc.get("availability"):
        doc["availability"] = "available"
    if "videos" not in doc or doc.get("videos") is None:
        doc["videos"] = []
    return doc


async def get_all_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    available: Optional[bool] = True,
    page: int = 1,
    limit: int = 24,
) -> dict:
    col = get_products_collection()
    query: dict = {}
    if category and category != "All":
        clean_cat = category.strip()
        cat_col = get_categories_collection()
        cat_doc = await cat_col.find_one({
            "$or": [
                {"slug": clean_cat.lower()},
                {"name": {"$regex": f"^{re.escape(clean_cat)}$", "$options": "i"}}
            ]
        })
        if cat_doc:
            query["category"] = cat_doc["name"]
        else:
            query["category"] = {"$regex": f"^{re.escape(clean_cat)}$", "$options": "i"}
    if search and search.strip():
        safe_search = re.escape(search.strip())
        query["$or"] = [
            {"name": {"$regex": safe_search, "$options": "i"}},
            {"description": {"$regex": safe_search, "$options": "i"}},
            {"color": {"$regex": safe_search, "$options": "i"}},
        ]
    if featured is not None:
        query["featured"] = featured
    if available is not None:
        query["available"] = available

    total = await col.count_documents(query)
    skip = (page - 1) * limit
    cursor = col.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    products = [doc_to_dict(doc) async for doc in cursor]
    return {"products": products, "total": total, "page": page, "pages": (total + limit - 1) // limit}


async def get_product_by_slug(slug: str) -> Optional[dict]:
    col = get_products_collection()
    doc = await col.find_one({"slug": slug})
    return doc_to_dict(doc) if doc else None


async def get_product_by_id(product_id: str) -> Optional[dict]:
    col = get_products_collection()
    try:
        doc = await col.find_one({"_id": ObjectId(product_id)})
        return doc_to_dict(doc) if doc else None
    except Exception:
        return None


async def create_product(data: ProductCreate) -> dict:
    col = get_products_collection()
    now = datetime.now(timezone.utc)
    slug = data.slug or slugify(data.name)

    # Ensure slug uniqueness
    base_slug = slug
    count = 0
    while await col.find_one({"slug": slug}):
        count += 1
        slug = f"{base_slug}-{count}"

    doc = {
        **data.model_dump(exclude={"slug"}),
        "slug": slug,
        "category": data.category.value if hasattr(data.category, "value") else str(data.category),
        "priceDisplayMode": data.priceDisplayMode.value if hasattr(data.priceDisplayMode, "value") else str(data.priceDisplayMode),
        "availability": data.availability.value if hasattr(data.availability, "value") else str(data.availability),
        "createdAt": now,
        "updatedAt": now,
    }
    result = await col.insert_one(doc)
    return await get_product_by_id(str(result.inserted_id))


async def update_product(product_id: str, data: ProductUpdate) -> Optional[dict]:
    col = get_products_collection()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "category" in updates and hasattr(updates["category"], "value"):
        updates["category"] = updates["category"].value
    if "priceDisplayMode" in updates and hasattr(updates["priceDisplayMode"], "value"):
        updates["priceDisplayMode"] = updates["priceDisplayMode"].value
    if "availability" in updates and hasattr(updates["availability"], "value"):
        updates["availability"] = updates["availability"].value
    updates["updatedAt"] = datetime.now(timezone.utc)
    try:
        await col.update_one({"_id": ObjectId(product_id)}, {"$set": updates})
        return await get_product_by_id(product_id)
    except Exception:
        return None


async def delete_product(product_id: str) -> bool:
    col = get_products_collection()
    try:
        result = await col.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count == 1
    except Exception:
        return False


async def get_collections_summary() -> List[dict]:
    col = get_products_collection()
    pipeline = [
        {"$match": {"available": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    results = []
    async for doc in col.aggregate(pipeline):
        results.append({"category": doc["_id"], "count": doc["count"]})
    return results


async def get_stats() -> dict:
    col = get_products_collection()
    total = await col.count_documents({})
    featured = await col.count_documents({"featured": True})
    return {"totalProducts": total, "featuredProducts": featured}
