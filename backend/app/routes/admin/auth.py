from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.schemas.admin import AdminLogin, TokenOut
from app.services.auth_service import authenticate_admin
from app.utils.security import create_access_token, decode_access_token
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")


async def get_current_admin(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["sub"]


@router.post("/login")
async def admin_login(data: AdminLogin):
    ok = await authenticate_admin(data.username, data.password)
    if not ok:
        return error_response("Invalid username or password", 401)
    token = create_access_token({"sub": data.username})
    return success_response(data={"access_token": token, "token_type": "bearer"}, message="Login successful")
