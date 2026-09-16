from fastapi import APIRouter, Query
from typing import Optional
from app.services import product_service
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
async def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
):
    result = await product_service.get_all_products(
        category=category, search=search, featured=featured, page=page, limit=limit
    )
    return success_response(data=result, message="Products retrieved successfully")


@router.get("/collections")
async def list_collections():
    collections = await product_service.get_collections_summary()
    return success_response(data=collections, message="Collections retrieved successfully")


@router.get("/{slug}")
async def get_product(slug: str):
    product = await product_service.get_product_by_slug(slug)
    if not product:
        return error_response("Product not found", 404)
    return success_response(data=product, message="Product retrieved successfully")
