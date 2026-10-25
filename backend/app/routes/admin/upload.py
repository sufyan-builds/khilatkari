import os
import re
import uuid
import logging
import tempfile
import shutil
from pathlib import Path
from typing import List, Tuple
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
import cloudinary
import cloudinary.uploader
from app.config import settings
from app.routes.admin.auth import get_current_admin
from app.utils.response import success_response, error_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/upload", tags=["admin-upload"])

# Base uploads directory: backend/uploads
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".heic", ".heif"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".ogg"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

ALLOWED_MIME_TYPES = {
    # Images (mobile, cross-browser, SVG explicitly excluded)
    "image/jpeg",
    "image/jpg",
    "image/pjpeg",
    "image/png",
    "image/x-png",
    "image/webp",
    "image/avif",
    "image/gif",
    "image/heic",
    "image/heif",
    "application/octet-stream",  # Permitted when validated by file signature
    # Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/ogg",
}

MAX_IMAGE_SIZE = 15 * 1024 * 1024  # 15 MB per image
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50 MB per video
CHUNK_SIZE = 64 * 1024             # 64 KB streaming buffer budget


def validate_file_signature(chunk: bytes, ext: str) -> bool:
    """
    Validate initial file signature/container header bytes against the claimed extension.
    
    Security & Container Validation Note:
    - JPEG, PNG, and GIF have rigid magic byte headers.
    - WebP uses RIFF with WEBP fourcc at offset 8.
    - Container formats (MP4, MOV, WebM, OGG, AVIF) have standard ISO/EBML container headers.
      Checking these headers verifies that the file is indeed a valid media container
      and prevents disguised text/script/HTML payloads.
    - Full bitstream codec integrity verification would require a dedicated demuxing/re-encoding
      pipeline (e.g. ffmpeg sandbox), but container signature verification provides solid
      defense-in-depth against malicious file uploads.
    """
    if len(chunk) < 4:
        return False

    if ext in {".jpg", ".jpeg"}:
        # JPEG begins with SOI marker: 0xFF 0xD8
        return len(chunk) >= 2 and chunk.startswith(b"\xff\xd8")

    if ext in {".heic", ".heif"}:
        # ISO BMFF with ftyp box and heic/heix/mif1/msf1 brand
        if len(chunk) >= 12 and chunk[4:8] == b"ftyp":
            return any(b in chunk[8:32] for b in (b"heic", b"heix", b"mif1", b"msf1"))
        return False

    if ext == ".png":
        # PNG 8-byte signature: \x89PNG\r\n\x1a\n
        return len(chunk) >= 8 and chunk.startswith(b"\x89PNG\r\n\x1a\n")

    if ext == ".gif":
        # GIF header: GIF87a or GIF89a
        return len(chunk) >= 6 and (chunk.startswith(b"GIF87a") or chunk.startswith(b"GIF89a"))

    if ext == ".webp":
        # RIFF header with WEBP fourcc at bytes 8-12
        return len(chunk) >= 12 and chunk.startswith(b"RIFF") and chunk[8:12] == b"WEBP"

    if ext == ".avif":
        # ISO Base Media File Format with ftyp box and avif/avis/mif1 brand
        if len(chunk) >= 12 and chunk[4:8] == b"ftyp":
            return any(b in chunk[8:32] for b in (b"avif", b"avis", b"mif1"))
        return False

    if ext in {".mp4", ".mov"}:
        # MP4/QuickTime ISO Base Media file: ftyp box at bytes 4-8 or standard atom box marker
        if len(chunk) >= 8:
            if chunk[4:8] == b"ftyp":
                return True
            if chunk[4:8] in {b"moov", b"mdat", b"wide", b"free", b"skip"}:
                return True
        return False

    if ext == ".webm":
        # EBML Header signature: 0x1A 0x45 0xDF 0xA3
        return len(chunk) >= 4 and chunk.startswith(b"\x1a\x45\xdf\xa3")

    if ext == ".ogg":
        # Ogg container capture pattern: "OggS"
        return len(chunk) >= 4 and chunk.startswith(b"OggS")

    return False


def sanitize_filename(filename: str, is_video: bool = False) -> str:
    """Generate a clean, safe filename with unique identifier and no path traversal."""
    stem = Path(filename).name  # Discard directory separators
    stem = Path(stem).stem
    clean_stem = re.sub(r"[^\w\-]", "-", stem).strip("-").lower()
    if not clean_stem:
        clean_stem = "video" if is_video else "photo"
    clean_stem = clean_stem[:40]
    ext = Path(filename).suffix.lower()
    unique_suffix = uuid.uuid4().hex[:10]
    return f"{clean_stem}-{unique_suffix}{ext}"


async def save_upload_stream(file: UploadFile) -> Tuple[bool, str, str]:
    """
    Streams and validates an uploaded file chunk-by-chunk.
    Enforces maximum size during read to avoid unbounded memory consumption.
    Validates file extension, MIME type, container magic bytes, and directory boundary.
    Uploads directly to Cloudinary when configured (production), or saves to local disk as fallback.
    Returns (success: bool, url_or_error_message: str, error_type: str).
    """
    if not file.filename:
        return False, "Filename cannot be empty.", "400"

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"File '{file.filename}' has unsupported format. Allowed formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}", "400"

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        return False, f"File '{file.filename}' has invalid MIME type '{file.content_type}'.", "400"

    is_video = ext in ALLOWED_VIDEO_EXTENSIONS
    max_size = MAX_VIDEO_SIZE if is_video else MAX_IMAGE_SIZE
    max_size_label = "50MB" if is_video else "15MB"

    safe_name = sanitize_filename(file.filename, is_video=is_video)

    use_cloudinary = bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )

    bytes_read = 0
    first_chunk = True

    # Use a secure temporary file during chunked stream reading
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_path = Path(temp_file.name)

    try:
        with open(temp_path, "wb") as f:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break

                bytes_read += len(chunk)
                if bytes_read > max_size:
                    f.close()
                    temp_path.unlink(missing_ok=True)
                    return False, f"File '{file.filename}' exceeds the maximum permitted size of {max_size_label}.", "400"

                if first_chunk:
                    first_chunk = False
                    if not validate_file_signature(chunk, ext):
                        f.close()
                        temp_path.unlink(missing_ok=True)
                        return False, f"File signature does not match the claimed {ext.upper()} format for '{file.filename}'.", "400"

                f.write(chunk)

        if bytes_read == 0:
            temp_path.unlink(missing_ok=True)
            return False, f"File '{file.filename}' is empty.", "400"

        # If Cloudinary credentials are provided, upload to Cloudinary persistent storage
        if use_cloudinary:
            cloudinary.config(
                cloud_name=settings.cloudinary_cloud_name,
                api_key=settings.cloudinary_api_key,
                api_secret=settings.cloudinary_api_secret,
                secure=True,
            )
            resource_type = "video" if is_video else "image"
            public_id = Path(safe_name).stem
            try:
                res = cloudinary.uploader.upload(
                    str(temp_path),
                    resource_type=resource_type,
                    folder="ms_fashions",
                    public_id=public_id,
                    overwrite=True,
                )
                secure_url = res.get("secure_url")
                returned_public_id = res.get("public_id")
                returned_resource_type = res.get("resource_type")

                if not secure_url or not isinstance(secure_url, str) or not secure_url.startswith("https://"):
                    raise ValueError("Cloudinary upload response did not include a valid HTTPS secure_url")
                if not returned_public_id:
                    raise ValueError("Cloudinary upload response missing public_id")
                if returned_resource_type and returned_resource_type != resource_type:
                    raise ValueError(f"Cloudinary resource_type mismatch: expected {resource_type}, got {returned_resource_type}")

                logger.info("Cloudinary upload verified successfully: %s (public_id: %s)", secure_url, returned_public_id)
                return True, secure_url, ""
            except Exception as e:
                logger.exception("Cloudinary upload failed for file: %s (%s)", file.filename, e)
                return False, f"Failed to upload '{file.filename}' to persistent cloud storage: {str(e)}", "500"
            finally:
                temp_path.unlink(missing_ok=True)

        # Prohibit ephemeral disk storage in production
        is_prod = str(settings.environment).strip().lower() == "production" or bool(os.getenv("RENDER"))
        if is_prod:
            temp_path.unlink(missing_ok=True)
            return False, "Persistent cloud storage is not configured. Ephemeral local storage is prohibited in production.", "500"

        # Fallback to local disk storage strictly for offline local development
        dest_path = UPLOADS_DIR / safe_name
        try:
            if not dest_path.resolve().is_relative_to(UPLOADS_DIR.resolve()):
                temp_path.unlink(missing_ok=True)
                return False, "Invalid file destination.", "400"
        except Exception:
            temp_path.unlink(missing_ok=True)
            return False, "Invalid file destination.", "400"

        shutil.move(str(temp_path), str(dest_path))
        return True, f"/uploads/{safe_name}", ""

    except Exception:
        logger.exception("Unexpected error saving uploaded file: %s", file.filename)
        temp_path.unlink(missing_ok=True)
        return False, f"Failed to save '{file.filename}' due to an internal error.", "500"


@router.post("")
async def upload_media(
    files: List[UploadFile] = File(...),
    _: str = Depends(get_current_admin),
):
    """Upload one or more product or homepage images/videos from local PC/device."""
    if not files:
        return error_response("No files provided for upload", 400)

    uploaded_urls = []

    for file in files:
        if not file.filename:
            continue

        success, result, err_code = await save_upload_stream(file)
        if not success:
            status_code = 500 if err_code == "500" else 400
            return error_response(result, status_code)

        uploaded_urls.append(result)

    if not uploaded_urls:
        return error_response("No valid files could be processed", 400)

    return success_response(
        data={"urls": uploaded_urls},
        message=f"{len(uploaded_urls)} media file(s) uploaded successfully",
        status_code=201,
    )


@router.post("/image")
async def upload_single_image(
    file: UploadFile = File(...),
    _: str = Depends(get_current_admin),
):
    """Upload a single image file (supports single-file upload clients and verification tests)."""
    success, result, err_code = await save_upload_stream(file)
    if not success:
        status_code = 500 if err_code == "500" else 400
        return JSONResponse(
            status_code=status_code,
            content={"success": False, "message": result, "data": None, "url": None},
        )

    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Image uploaded successfully", "url": result, "data": {"url": result}},
    )
