import logging
from fastapi import APIRouter, Depends
from app.schemas.appointment import AppointmentCreate
from app.services import appointment_service
from app.utils.response import success_response, error_response
from app.utils.rate_limit import SlidingWindowRateLimiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

# Rate limiter: 3 appointment submissions per 60 seconds per client IP
appointment_rate_limiter = SlidingWindowRateLimiter(requests_limit=3, window_seconds=60)


@router.post("", dependencies=[Depends(appointment_rate_limiter)])
async def submit_appointment(data: AppointmentCreate):
    try:
        appt = await appointment_service.create_appointment(data)
        return success_response(
            data=appt,
            message="Your appointment request has been received. We will contact you through WhatsApp to confirm the details.",
            status_code=201,
        )
    except Exception:
        logger.exception("Unexpected error while submitting appointment request")
        return error_response("Unable to submit appointment request. Please try again.", 500)
