from fastapi import APIRouter
from app.services import category_service
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("")
async def list_categories():
    """List active categories for public storefront and filters."""
    categories = await category_service.get_all_categories(active_only=True)
    return success_response(data=categories, message="Categories retrieved successfully")


@router.get("/homepage")
async def list_homepage_categories():
    """List active categories featured on the homepage 'Explore the Collection' section."""
    categories = await category_service.get_all_categories(featured_homepage_only=True)
    return success_response(data=categories, message="Homepage categories retrieved successfully")


@router.get("/{key}")
async def get_category(key: str):
    """Get category details by slug or ID."""
    cat = await category_service.get_category_by_slug_or_name(key)
    if not cat:
        cat = await category_service.get_category_by_id(key)
    if not cat:
        return error_response("Category not found", 404)
    return success_response(data=cat, message="Category retrieved successfully")
