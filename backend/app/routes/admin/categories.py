import logging
from fastapi import APIRouter, Depends
from app.routes.admin.auth import get_current_admin
from app.schemas.category import CategoryCreate, CategoryUpdate, ProductReassignRequest
from app.services import category_service
from app.utils.response import success_response, error_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/categories", tags=["admin-categories"])


@router.get("")
async def admin_list_categories(_: str = Depends(get_current_admin)):
    """List all categories for admin management (including active & hidden, with product counts)."""
    categories = await category_service.get_all_categories(active_only=False)
    return success_response(data=categories, message="Categories retrieved successfully")


@router.post("")
async def admin_create_category(data: CategoryCreate, _: str = Depends(get_current_admin)):
    """Create a new category."""
    try:
        category = await category_service.create_category(data)
        return success_response(data=category, message="Category created successfully", status_code=201)
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception:
        logger.exception("Unexpected error creating category")
        return error_response("Failed to create category due to an internal server error.", 500)


@router.put("/{cat_id}")
async def admin_update_category(cat_id: str, data: CategoryUpdate, _: str = Depends(get_current_admin)):
    """Update category details, images, framing, ordering, or visibility."""
    try:
        category = await category_service.update_category(cat_id, data)
        if not category:
            return error_response("Category not found", 404)
        return success_response(data=category, message="Category updated successfully")
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception:
        logger.exception("Unexpected error updating category: %s", cat_id)
        return error_response("Failed to update category due to an internal server error.", 500)


@router.delete("/{cat_id}")
async def admin_delete_category(cat_id: str, _: str = Depends(get_current_admin)):
    """Delete a category. Rejects if any products are assigned."""
    try:
        deleted = await category_service.delete_category(cat_id)
        if not deleted:
            return error_response("Category not found", 404)
        return success_response(message="Category deleted successfully")
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception:
        logger.exception("Unexpected error deleting category: %s", cat_id)
        return error_response("Failed to delete category due to an internal server error.", 500)


@router.post("/reassign")
async def admin_reassign_products(data: ProductReassignRequest, _: str = Depends(get_current_admin)):
    """Reassign all products from source category to target category."""
    try:
        count = await category_service.reassign_category_products(
            source_name=data.sourceCategoryName,
            target_name=data.targetCategoryName
        )
        return success_response(
            data={"reassignedCount": count},
            message=f"Successfully reassigned {count} products from '{data.sourceCategoryName}' to '{data.targetCategoryName}'."
        )
    except Exception:
        logger.exception("Unexpected error reassigning category products")
        return error_response("Failed to reassign products due to an internal server error.", 500)
