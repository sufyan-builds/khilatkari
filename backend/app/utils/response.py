from typing import Any, Optional
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder


def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": jsonable_encoder(data), "message": message},
    )


def error_response(message: str = "An error occurred", status_code: int = 400, errors: Optional[dict] = None) -> JSONResponse:
    body: dict = {"success": False, "message": message}
    if errors:
        body["errors"] = jsonable_encoder(errors)
    return JSONResponse(status_code=status_code, content=body)
