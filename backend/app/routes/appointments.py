from fastapi import APIRouter
from app.schemas.appointment import AppointmentCreate
from app.services import appointment_service
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("")
async def submit_appointment(data: AppointmentCreate):
    try:
        appt = await appointment_service.create_appointment(data)
        return success_response(
            data=appt,
            message="Your appointment request has been received. We will contact you through WhatsApp to confirm the details.",
            status_code=201,
        )
    except Exception as e:
        return error_response("Unable to submit appointment request. Please try again.", 500)
