import os
import re
import uuid
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from app.routes.admin.auth import get_current_admin
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/api/admin/upload", tags=["admin-upload"])

# Base uploads directory: backend/uploads
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB per file


def sanitize_filename(filename: str) -> str:
    """Generate a clean, safe filename with unique identifier."""
    stem = Path(filename).stem
    # Replace non-alphanumeric characters with hyphens
    clean_stem = re.sub(r"[^\w\-]", "-", stem).strip("-").lower()
    if not clean_stem:
        clean_stem = "photo"
    clean_stem = clean_stem[:40]  # truncate length
    ext = Path(filename).suffix.lower()
    unique_suffix = uuid.uuid4().hex[:10]
    return f"{clean_stem}-{unique_suffix}{ext}"


@router.post("")
async def upload_images(
    files: List[UploadFile] = File(...),
    _: str = Depends(get_current_admin),
):
    """Upload one or more product images from local PC/device."""
    if not files:
        return error_response("No files provided for upload", 400)

    uploaded_urls = []

    for file in files:
        # Validate filename and extension
        if not file.filename:
            continue

        ext = Path(file.filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            return error_response(
                f"File '{file.filename}' has unsupported format. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
                400,
            )

        if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
            return error_response(
                f"File '{file.filename}' has invalid MIME type '{file.content_type}'.",
                400,
            )

        # Read content
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            return error_response(
                f"File '{file.filename}' exceeds maximum allowed size of 15MB.",
                400,
            )

        safe_name = sanitize_filename(file.filename)
        dest_path = UPLOADS_DIR / safe_name

        try:
            with open(dest_path, "wb") as f:
                f.write(content)
            uploaded_urls.append(f"/uploads/{safe_name}")
        except Exception as e:
            return error_response(f"Failed to save '{file.filename}': {str(e)}", 500)

    if not uploaded_urls:
        return error_response("No valid files could be processed", 400)

    return success_response(
        data={"urls": uploaded_urls},
        message=f"{len(uploaded_urls)} image(s) uploaded successfully",
        status_code=201,
    )
