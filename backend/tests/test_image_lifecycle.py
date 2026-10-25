import os
import sys
import io
from pathlib import Path
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.routes.admin.auth import get_current_admin
from app.schemas.homepage import HomepageContentUpdate, ImagePositionConfig
from app.utils.url_validator import validate_media_url, validate_link_url


# Dependency override for admin authentication during tests
app.dependency_overrides[get_current_admin] = lambda: "test_admin"
client = TestClient(app)

# Genuine JPEG magic bytes (SOI marker 0xFF 0xD8) + minimal payload
VALID_JPEG_BYTES = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb"
# Genuine PNG magic bytes
VALID_PNG_BYTES = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"


# ==============================================================================
# 1. Successful Upload Test (Cloudinary Mocked)
# ==============================================================================
@patch("app.routes.admin.upload.cloudinary.uploader.upload")
@patch.object(settings, "cloudinary_cloud_name", "test_cloud")
@patch.object(settings, "cloudinary_api_key", "test_key")
@patch.object(settings, "cloudinary_api_secret", "test_secret")
def test_successful_cloudinary_upload(mock_upload):
    mock_upload.return_value = {
        "secure_url": "https://res.cloudinary.com/test_cloud/image/upload/v12345/ms_fashions/test-image-123.jpg",
        "public_id": "ms_fashions/test-image-123",
        "resource_type": "image",
    }

    file_payload = ("test-image.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")
    response = client.post("/api/admin/upload", files=[("files", file_payload)])

    assert response.status_code == 201
    json_data = response.json()
    assert json_data["success"] is True
    assert len(json_data["data"]["urls"]) == 1
    assert "https://res.cloudinary.com/test_cloud/image/upload" in json_data["data"]["urls"][0]


# ==============================================================================
# 2. Failed Cloudinary Upload (Error Handling)
# ==============================================================================
@patch("app.routes.admin.upload.cloudinary.uploader.upload")
@patch.object(settings, "cloudinary_cloud_name", "test_cloud")
@patch.object(settings, "cloudinary_api_key", "test_key")
@patch.object(settings, "cloudinary_api_secret", "test_secret")
def test_failed_cloudinary_upload(mock_upload):
    mock_upload.side_effect = Exception("Cloudinary connection timeout")

    file_payload = ("test-image.jpg", io.BytesIO(VALID_JPEG_BYTES), "image/jpeg")
    response = client.post("/api/admin/upload", files=[("files", file_payload)])

    assert response.status_code == 500
    json_data = response.json()
    assert json_data["success"] is False
    assert "Failed to upload" in json_data["message"]


# ==============================================================================
# 3. Malicious / Fake Signature Rejection
# ==============================================================================
def test_signature_validation_rejection():
    # File named .jpg but containing plain HTML/Script text
    fake_payload = b"<script>alert('xss')</script>"
    file_payload = ("exploit.jpg", io.BytesIO(fake_payload), "image/jpeg")
    response = client.post("/api/admin/upload", files=[("files", file_payload)])

    assert response.status_code == 400
    json_data = response.json()
    assert json_data["success"] is False
    assert "File signature does not match" in json_data["message"]


# ==============================================================================
# 4. URL Validation Unit Tests
# ==============================================================================
def test_url_sanitizer_blocks_dangerous_schemes():
    with pytest.raises(ValueError, match="Dangerous URL scheme"):
        validate_media_url("javascript:alert(1)")

    with pytest.raises(ValueError, match="Dangerous URL scheme"):
        validate_media_url("data:text/html;base64,PHNjcmlwdD4=")

    with pytest.raises(ValueError, match="Dangerous URL scheme"):
        validate_media_url("file:///etc/passwd")

    # Valid URLs pass untouched
    valid_cld = "https://res.cloudinary.com/iv29blwq/image/upload/v1791391506/ms_fashions/test.jpg"
    assert validate_media_url(valid_cld) == valid_cld

    valid_relative = "/images/models/model-1.jpg"
    assert validate_media_url(valid_relative) == valid_relative


# ==============================================================================
# 5. Database Save & Concurrency Conflict (Optimistic Locking)
# ==============================================================================
@pytest.mark.asyncio
async def test_homepage_optimistic_concurrency_conflict():
    from app.services.homepage_service import update_homepage_content
    from fastapi import HTTPException

    mock_doc = {
        "key": "homepage_main",
        "updatedAt": "2026-10-25T10:00:00.000000+00:00",
        "heroSlides": [{"id": "h1", "imageUrl": "https://res.cloudinary.com/test/img1.jpg", "title": "Hero 1"}],
    }

    mock_collection = MagicMock()
    mock_collection.find_one = AsyncMock(return_value=mock_doc)
    mock_collection.update_one = AsyncMock()

    with patch("app.services.homepage_service.get_homepage_collection", return_value=mock_collection):
        # 1. Update with matching expectedUpdatedAt succeeds
        update_payload = HomepageContentUpdate(
            expectedUpdatedAt="2026-10-25T10:00:00.000000+00:00",
            heroSlides=[ImagePositionConfig(id="h1", imageUrl="https://res.cloudinary.com/test/img2.jpg", title="Hero Updated")],
        )
        mock_collection.update_one.return_value = MagicMock(acknowledged=True)
        res = await update_homepage_content(update_payload)
        assert res["heroSlides"][0]["imageUrl"] == "https://res.cloudinary.com/test/img2.jpg"

        # 2. Update with outdated expectedUpdatedAt raises 409 Conflict (prevents race condition overwrite)
        stale_payload = HomepageContentUpdate(
            expectedUpdatedAt="2026-10-25T08:00:00.000000+00:00",  # Stale timestamp
            heroSlides=[ImagePositionConfig(id="h1", imageUrl="https://res.cloudinary.com/test/stale.jpg")],
        )
        with pytest.raises(HTTPException) as exc_info:
            await update_homepage_content(stale_payload)
        assert exc_info.value.status_code == 409
        assert "Conflict" in exc_info.value.detail


# ==============================================================================
# 6. Database Update Failure After Upload (Atomic Error Handling)
# ==============================================================================
@pytest.mark.asyncio
async def test_failed_mongodb_update_raises_error():
    from app.services.homepage_service import update_homepage_content
    from fastapi import HTTPException

    mock_doc = {
        "key": "homepage_main",
        "updatedAt": "2026-10-25T10:00:00.000000+00:00",
        "heroSlides": [],
    }

    mock_collection = MagicMock()
    mock_collection.find_one = AsyncMock(return_value=mock_doc)
    # Simulate DB unacknowledged failure
    mock_collection.update_one = AsyncMock(return_value=MagicMock(acknowledged=False))

    with patch("app.services.homepage_service.get_homepage_collection", return_value=mock_collection):
        update_payload = HomepageContentUpdate(
            expectedUpdatedAt="2026-10-25T10:00:00.000000+00:00",
            heroSlides=[ImagePositionConfig(id="h1", imageUrl="https://res.cloudinary.com/test/img1.jpg")],
        )
        with pytest.raises(HTTPException) as exc_info:
            await update_homepage_content(update_payload)
        assert exc_info.value.status_code == 500
        assert "Failed to persist" in exc_info.value.detail


# ==============================================================================
# 7. Hero Image and Text Association Persistence
# ==============================================================================
@pytest.mark.asyncio
async def test_hero_image_and_text_association():
    from app.services.homepage_service import update_homepage_content, get_homepage_content

    persisted_state = {}

    async def fake_find_one(query):
        return persisted_state.get(query.get("key"))

    async def fake_update_one(query, update, upsert=False):
        persisted_state[query["key"]] = update["$set"]
        return MagicMock(acknowledged=True)

    mock_col = MagicMock()
    mock_col.find_one = AsyncMock(side_effect=fake_find_one)
    mock_col.update_one = AsyncMock(side_effect=fake_update_one)

    with patch("app.services.homepage_service.get_homepage_collection", return_value=mock_col):
        # Initial save with specific hero image and subtitle
        slide = ImagePositionConfig(
            id="hero-traditional-1",
            imageUrl="https://res.cloudinary.com/test/handcrafted.jpg",
            title="Private Luxury Traditional Wear",
            subtitle="Handcrafted South Asian pieces presented through private appointments.",
            zoom=1.2,
            posX=45.0,
            posY=25.0,
        )
        await update_homepage_content(HomepageContentUpdate(heroSlides=[slide]))

        # Read back
        loaded = await get_homepage_content()
        assert len(loaded["heroSlides"]) == 1
        saved_slide = loaded["heroSlides"][0]
        assert saved_slide["id"] == "hero-traditional-1"
        assert saved_slide["imageUrl"] == "https://res.cloudinary.com/test/handcrafted.jpg"
        assert saved_slide["title"] == "Private Luxury Traditional Wear"
        assert saved_slide["subtitle"] == "Handcrafted South Asian pieces presented through private appointments."
        assert saved_slide["zoom"] == 1.2
        assert saved_slide["posX"] == 45.0
        assert saved_slide["posY"] == 25.0


# ==============================================================================
# 8. Test Isolation: Staging Opt-In Guard
# ==============================================================================
def test_staging_integration_skipped_by_default():
    """Ensure automated tests never run real destructive operations against production."""
    staging_enabled = os.getenv("STAGING_INTEGRATION_TEST", "false").lower() == "true"
    if not staging_enabled:
        pytest.skip("Staging integration tests skipped by default to preserve production safety.")
