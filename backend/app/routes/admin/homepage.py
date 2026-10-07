from fastapi import APIRouter, Depends
from app.routes.admin.auth import get_current_admin
from app.schemas.homepage import HomepageContentUpdate
from app.services import homepage_service
from app.utils.response import success_response

router = APIRouter(prefix="/api/admin/homepage", tags=["admin-homepage"])


@router.get("")
async def get_admin_homepage_content(current_admin: str = Depends(get_current_admin)):
    content = await homepage_service.get_homepage_content()
    return success_response(data=content, message="Homepage visual content loaded")


@router.put("")
async def update_admin_homepage_content(
    payload: HomepageContentUpdate,
    current_admin: str = Depends(get_current_admin),
):
    updated = await homepage_service.update_homepage_content(payload)
    return success_response(data=updated, message="Homepage visual settings saved successfully")


@router.post("/reset")
async def reset_admin_homepage_content(current_admin: str = Depends(get_current_admin)):
    reset_data = await homepage_service.reset_homepage_content()
    return success_response(data=reset_data, message="Homepage visuals reset to original defaults")
