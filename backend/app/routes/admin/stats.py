from fastapi import APIRouter, Depends
from app.routes.admin.auth import get_current_admin
from app.services import product_service, appointment_service
from app.utils.response import success_response

router = APIRouter(prefix="/api/admin/stats", tags=["admin-stats"])


@router.get("")
async def admin_stats(_: str = Depends(get_current_admin)):
    p_stats = await product_service.get_stats()
    a_stats = await appointment_service.get_appointment_stats()
    return success_response(data={**p_stats, **a_stats})
