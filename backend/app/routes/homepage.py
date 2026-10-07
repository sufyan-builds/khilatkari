from fastapi import APIRouter
from app.services import homepage_service
from app.utils.response import success_response

router = APIRouter(prefix="/api/homepage", tags=["homepage"])


@router.get("")
async def get_public_homepage_content():
    content = await homepage_service.get_homepage_content()
    return success_response(data=content, message="Homepage visual content retrieved")
