from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.schemas.admin import AdminLogin, TokenOut
from app.services.auth_service import authenticate_admin
from app.utils.security import create_access_token, decode_access_token
from app.utils.response import success_response, error_response
from app.utils.rate_limit import SlidingWindowRateLimiter

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/auth/login")

# Rate limiter: 5 login attempts per 60 seconds per client IP
login_rate_limiter = SlidingWindowRateLimiter(requests_limit=5, window_seconds=60)


async def get_current_admin(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload["sub"]


@router.post("/login", dependencies=[Depends(login_rate_limiter)])
async def admin_login(data: AdminLogin):
    ok = await authenticate_admin(data.username, data.password)
    if not ok:
        return error_response("Invalid username or password", 401)
    token = create_access_token({"sub": data.username})
    return success_response(data={"access_token": token, "token_type": "bearer"}, message="Login successful")
