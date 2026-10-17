import copy
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from app.database import get_homepage_collection
from app.schemas.homepage import HomepageContentUpdate

logger = logging.getLogger(__name__)

DEFAULT_HOMEPAGE_CONTENT: Dict[str, Any] = {
    "heroSlides": [
        {
            "id": "hero-1",
            "mediaType": "image",
            "imageUrl": "",
            "videoUrl": None,
            "posterUrl": None,
            "zoom": 1.0,
            "posX": 50.0,
            "posY": 15.0,
            "title": "Private Luxury Traditional Wear",
            "subtitle": "Handcrafted South Asian pieces presented through private appointments.",
        },
    ],
    "experienceImage": {
        "id": "exp-1",
        "mediaType": "image",
        "imageUrl": "",
        "videoUrl": None,
        "posterUrl": None,
        "zoom": 1.0,
        "posX": 50.0,
        "posY": 15.0,
        "title": "The Private Viewing Experience",
    },
    "galleryStrip": [],
    "statementSection": {
        "backgroundImage": {
            "id": "stmt-bg",
            "mediaType": "image",
            "imageUrl": "",
            "zoom": 1.0,
            "posX": 50.0,
            "posY": 0.0,
        },
        "headlineMain": "Discover Your Next",
        "headlineItalic": "Statement Piece.",
        "bodyText": "Request a private appointment to experience our hand-crafted bridal, Chikankari, and luxury formal collections in the comfort of your own home.",
        "button1Text": "Book a Private Appointment",
        "button1Link": "/appointments",
        "button2Text": "Chat on WhatsApp",
        "button2Link": "",
    },
    "aboutPage": {
        "heroHeadlineMain": "A Celebration of Authentic",
        "heroHeadlineItalic": "South Asian Heritage",
        "heroIntroText": "KhilatKari was born out of a profound admiration for the timeless artistry of subcontinental needlework, reimagined for the contemporary woman through an exclusive in-home experience.",
        "philosophyHeadline": "Why We Operate Exclusively by Appointment",
        "philosophyPara1": "In an age of mass-produced, fast-fashion retail, true luxury has become rare. Browsing crowded store racks with hurried sales staff cannot do justice to a bridal ensemble adorned with months of delicate hand-embroidery.",
        "philosophyPara2": "At KhilatKari, we replaced the conventional store with an intimate, private home viewing model. You and your family review our curated collections within the quiet comfort of your own living room across Lahore, Islamabad, Rawalpindi, and Peshawar.",
        "philosophyPara3": "You feel the weight of pure chiffon, inspect the gleam of genuine metal Kamdani threads, and drape shawls under warm home lighting before making any decision.",
        "ctaHeadline": "Experience the Collection Firsthand",
        "ctaBodyText": "Request your private appointment today and discover handcrafted luxury in the comfort of your own home.",
        "collageImage1": {
            "id": "about-col-1",
            "mediaType": "image",
            "imageUrl": "",
            "zoom": 1.0,
            "posX": 50.0,
            "posY": 0.0,
        },
        "collageImage2": {
            "id": "about-col-2",
            "mediaType": "image",
            "imageUrl": "",
            "zoom": 1.0,
            "posX": 50.0,
            "posY": 0.0,
        },
        "collageImage3": {
            "id": "about-col-3",
            "mediaType": "image",
            "imageUrl": "",
            "zoom": 1.0,
            "posX": 50.0,
            "posY": 0.0,
        },
        "collageImage4": {
            "id": "about-col-4",
            "mediaType": "image",
            "imageUrl": "",
            "zoom": 1.0,
            "posX": 50.0,
            "posY": 0.0,
        },
    },
    "collectionsPage": {
        "label": "Private Lookbook",
        "heading": "The Collection",
        "description": "Each piece is handcrafted and available for private viewing at your home. Browse, explore, then book an appointment to see them in person.",
    },
}


def strip_legacy_model_urls(data: Any) -> Any:
    """Purges obsolete /images/models/model-*.jpg references so they are never served or persisted for homepage."""
    if isinstance(data, dict):
        cleaned = {}
        for k, v in data.items():
            if isinstance(v, str) and "/images/models/model-" in v:
                cleaned[k] = ""
            else:
                cleaned[k] = strip_legacy_model_urls(v)
        return cleaned
    elif isinstance(data, list):
        cleaned_list = []
        for item in data:
            if isinstance(item, dict):
                cleaned_item = strip_legacy_model_urls(item)
                # Omit obsolete seeded gallery items that have no configured image/video
                if str(cleaned_item.get("id", "")).startswith("strip-") and not cleaned_item.get("imageUrl") and not cleaned_item.get("videoUrl"):
                    continue
                cleaned_list.append(cleaned_item)
            elif isinstance(item, str) and "/images/models/model-" in item:
                continue
            else:
                cleaned_list.append(item)
        return cleaned_list
    return data


def deep_merge(target: Dict[str, Any], source: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively merges source into target without resurrecting defaults for cleared fields."""
    for key, value in source.items():
        if isinstance(value, dict) and isinstance(target.get(key), dict):
            deep_merge(target[key], value)
        else:
            # Explicitly overwrite target with source value (even if None, empty list, or empty string)
            # This ensures intentionally cleared/emptied sections are honored.
            target[key] = copy.deepcopy(value)
    return target


async def get_homepage_content() -> Dict[str, Any]:
    col = get_homepage_collection()
    doc = await col.find_one({"key": "homepage_main"})
    default_copy = copy.deepcopy(DEFAULT_HOMEPAGE_CONTENT)
    if not doc:
        return default_copy
    doc.pop("_id", None)
    doc.pop("key", None)

    # Detect and purge any legacy model references that might have been saved in DB from prior seeds
    doc_str = str(doc)
    had_legacy = "/images/models/model-" in doc_str
    doc = strip_legacy_model_urls(doc)

    # Merge saved doc over default copy so that all sections/keys are always present
    merged = deep_merge(default_copy, doc)

    # If legacy URLs were present in MongoDB, persist the sanitized document back
    if had_legacy:
        await col.update_one(
            {"key": "homepage_main"},
            {"$set": {**merged, "key": "homepage_main"}},
            upsert=True,
        )

    # Ensure mediaType is present for backward compatibility
    for slide in merged.get("heroSlides", []):
        if not slide.get("mediaType"):
            slide["mediaType"] = "video" if slide.get("videoUrl") else "image"
    if merged.get("experienceImage") and not merged["experienceImage"].get("mediaType"):
        merged["experienceImage"]["mediaType"] = "video" if merged["experienceImage"].get("videoUrl") else "image"
    for item in merged.get("galleryStrip", []):
        if not item.get("mediaType"):
            item["mediaType"] = "image"

    return merged


async def update_homepage_content(data: HomepageContentUpdate) -> Dict[str, Any]:
    col = get_homepage_collection()
    current = await get_homepage_content()
    update_dict = data.model_dump(exclude_unset=True)

    # NOTE: strip_legacy_model_urls is intentionally NOT called on the incoming payload.
    # It is only applied to data read from MongoDB (in get_homepage_content) to sanitise
    # old seeded records. Calling it here would wipe valid admin-selected catalog image
    # paths (/images/models/model-*.jpg), causing blank images on the public site.

    # Deep merge the update_dict into current
    deep_merge(current, update_dict)

    current["updatedAt"] = datetime.now(timezone.utc).isoformat()

    # Diagnostic log — omits sensitive values but confirms what is being persisted
    hero_slides = current.get("heroSlides", [])
    logger.info(
        "Homepage update: saving %d hero slide(s). Slide 0 imageUrl present: %s",
        len(hero_slides),
        bool(hero_slides[0].get("imageUrl") if hero_slides else False),
    )

    await col.update_one(
        {"key": "homepage_main"},
        {"$set": {**current, "key": "homepage_main"}},
        upsert=True,
    )
    current.pop("key", None)
    return current


async def reset_homepage_content() -> Dict[str, Any]:
    col = get_homepage_collection()
    reset_data = copy.deepcopy(DEFAULT_HOMEPAGE_CONTENT)
    reset_data["updatedAt"] = datetime.now(timezone.utc).isoformat()
    await col.update_one(
        {"key": "homepage_main"},
        {"$set": {**reset_data, "key": "homepage_main"}},
        upsert=True,
    )
    return reset_data
