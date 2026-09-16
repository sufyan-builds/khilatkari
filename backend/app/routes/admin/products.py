from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.routes.admin.auth import get_current_admin
from app.schemas.product import ProductCreate, ProductUpdate
from app.services import product_service
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/admin/products", tags=["admin-products"])


@router.get("")
async def admin_list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: str = Depends(get_current_admin),
):
    result = await product_service.get_all_products(page=page, limit=limit, available=None)
    return success_response(data=result)


@router.post("")
async def admin_create_product(data: ProductCreate, _: str = Depends(get_current_admin)):
    try:
        product = await product_service.create_product(data)
        return success_response(data=product, message="Product created successfully", status_code=201)
    except Exception as e:
        return error_response(f"Failed to create product: {str(e)}", 500)


@router.put("/{product_id}")
async def admin_update_product(product_id: str, data: ProductUpdate, _: str = Depends(get_current_admin)):
    product = await product_service.update_product(product_id, data)
    if not product:
        return error_response("Product not found", 404)
    return success_response(data=product, message="Product updated successfully")


@router.delete("/{product_id}")
async def admin_delete_product(product_id: str, _: str = Depends(get_current_admin)):
    deleted = await product_service.delete_product(product_id)
    if not deleted:
        return error_response("Product not found", 404)
    return success_response(message="Product deleted successfully")
