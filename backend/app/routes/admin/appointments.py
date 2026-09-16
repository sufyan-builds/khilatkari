from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.routes.admin.auth import get_current_admin
from app.schemas.appointment import AppointmentStatusUpdate
from app.services import appointment_service
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/admin/appointments", tags=["admin-appointments"])


@router.get("")
async def admin_list_appointments(
    status: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: str = Depends(get_current_admin),
):
    result = await appointment_service.get_all_appointments(
        status=status, city=city, date_filter=date, page=page, limit=limit
    )
    return success_response(data=result)


@router.get("/{appt_id}")
async def admin_get_appointment(appt_id: str, _: str = Depends(get_current_admin)):
    appt = await appointment_service.get_appointment_by_id(appt_id)
    if not appt:
        return error_response("Appointment not found", 404)
    return success_response(data=appt)


@router.put("/{appt_id}")
@router.patch("/{appt_id}/status")
async def admin_update_status(appt_id: str, data: AppointmentStatusUpdate, _: str = Depends(get_current_admin)):
    appt = await appointment_service.update_appointment_status(appt_id, data)
    if not appt:
        return error_response("Appointment not found", 404)
    return success_response(data=appt, message="Status updated successfully")
