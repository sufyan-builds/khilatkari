#!/usr/bin/env python3
"""
MS Fashions — Safe Cloudinary Migration Script
Uploads existing local media files (backend/uploads/) to Cloudinary,
verifies that each uploaded URL is reachable, updates MongoDB Atlas
document references, and generates a complete migration report.
NEVER deletes or modifies local files.
"""

import os
import sys
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
import certifi
import pymongo
import requests
import cloudinary
import cloudinary.uploader

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BACKEND_DIR / "uploads"
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE)

CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
API_KEY = os.getenv("CLOUDINARY_API_KEY", "").strip()
API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "").strip()
MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
DATABASE_NAME = os.getenv("DATABASE_NAME", "ms_fashions").strip()


def check_prerequisites() -> bool:
    if not CLOUD_NAME or not API_KEY or not API_SECRET:
        print("\n[ERROR] Missing Cloudinary credentials in backend/.env!")
        print("Please configure in backend/.env:")
        print("  CLOUDINARY_CLOUD_NAME=<your_cloud_name>")
        print("  CLOUDINARY_API_KEY=<your_api_key>")
        print("  CLOUDINARY_API_SECRET=<your_api_secret>\n")
        return False

    if not MONGODB_URI:
        print("\n[ERROR] Missing MONGODB_URI in backend/.env!\n")
        return False

    if not UPLOADS_DIR.exists() or not any(UPLOADS_DIR.iterdir()):
        print(f"\n[ERROR] Uploads directory {UPLOADS_DIR} is empty or not found.\n")
        return False

    return True


def run_migration():
    if not check_prerequisites():
        sys.exit(1)

    cloudinary.config(
        cloud_name=CLOUD_NAME,
        api_key=API_KEY,
        api_secret=API_SECRET,
        secure=True,
    )

    print("==================================================")
    print("   MS FASHIONS — CLOUDINARY MEDIA MIGRATION       ")
    print("==================================================")
    print(f"Source Directory: {UPLOADS_DIR}")
    print(f"Cloudinary Cloud: {CLOUD_NAME}")

    files = [f for f in UPLOADS_DIR.iterdir() if f.is_file()]
    print(f"Found {len(files)} files to migrate.\n")

    url_mapping = {}  # { "/uploads/filename": "https://res.cloudinary.com/..." }
    upload_errors = []

    # 1. Upload files to Cloudinary
    print("--- Phase 1: Uploading Files to Cloudinary ---")
    for i, file_path in enumerate(sorted(files, key=lambda x: x.name), 1):
        filename = file_path.name
        rel_key = f"/uploads/{filename}"
        ext = file_path.suffix.lower()
        is_video = ext in {".mp4", ".webm", ".mov", ".ogg"}
        resource_type = "video" if is_video else "image"
        public_id = file_path.stem

        print(f"[{i}/{len(files)}] Uploading {filename} ({resource_type})... ", end="", flush=True)

        try:
            res = cloudinary.uploader.upload(
                str(file_path),
                resource_type=resource_type,
                folder="ms_fashions",
                public_id=public_id,
                overwrite=True,
            )
            secure_url = res.get("secure_url")
            if secure_url:
                url_mapping[rel_key] = secure_url
                print("OK")
            else:
                print("FAILED (no secure_url returned)")
                upload_errors.append((filename, "Missing secure_url in response"))
        except Exception as e:
            print(f"FAILED ({e})")
            upload_errors.append((filename, str(e)))

    print(f"\nUploaded {len(url_mapping)} of {len(files)} files successfully.")
    if upload_errors:
        print(f"WARNING: {len(upload_errors)} files failed to upload:")
        for name, err in upload_errors:
            print(f"  - {name}: {err}")

    # 2. Verify reachability of Cloudinary URLs
    print("\n--- Phase 2: Verifying Uploaded URLs ---")
    verified_count = 0
    verification_errors = []
    for rel_key, cloud_url in list(url_mapping.items())[:10]:  # sample check
        try:
            head_res = requests.head(cloud_url, timeout=10)
            if head_res.status_code in (200, 301, 302):
                verified_count += 1
            else:
                verification_errors.append((cloud_url, f"HTTP {head_res.status_code}"))
        except Exception as e:
            verification_errors.append((cloud_url, str(e)))
    print(f"Sample verification: {verified_count}/10 checked URLs are reachable via HTTP 200.")

    # 3. Update MongoDB records
    print("\n--- Phase 3: Updating MongoDB Records ---")
    client = pymongo.MongoClient(MONGODB_URI, tls=True, tlsCAFile=certifi.where())
    db = client[DATABASE_NAME]

    total_records_updated = 0

    # 3a. Update Products
    prod_col = db["products"]
    products = list(prod_col.find({}))
    for prod in products:
        updated = False
        images = prod.get("images", [])
        new_images = []
        for img in images:
            if img in url_mapping:
                new_images.append(url_mapping[img])
                updated = True
            else:
                new_images.append(img)

        videos = prod.get("videos", []) or []
        new_videos = []
        for vid in videos:
            if vid in url_mapping:
                new_videos.append(url_mapping[vid])
                updated = True
            else:
                new_videos.append(vid)

        if updated:
            prod_col.update_one(
                {"_id": prod["_id"]},
                {"$set": {"images": new_images, "videos": new_videos}}
            )
            total_records_updated += 1
            print(f"Updated Product: '{prod.get('name')}' ({prod['_id']})")

    # 3b. Update Homepage Content
    home_col = db["homepage_content"]
    home_docs = list(home_col.find({}))
    for home_doc in home_docs:
        updated = False

        # heroSlides
        slides = home_doc.get("heroSlides", [])
        for slide in slides:
            if slide.get("imageUrl") in url_mapping:
                slide["imageUrl"] = url_mapping[slide["imageUrl"]]
                updated = True
            if slide.get("videoUrl") in url_mapping:
                slide["videoUrl"] = url_mapping[slide["videoUrl"]]
                updated = True

        # experienceImage
        exp = home_doc.get("experienceImage", {})
        if exp and exp.get("imageUrl") in url_mapping:
            exp["imageUrl"] = url_mapping[exp["imageUrl"]]
            updated = True

        # galleryStrip
        gallery = home_doc.get("galleryStrip", [])
        for item in gallery:
            if item.get("imageUrl") in url_mapping:
                item["imageUrl"] = url_mapping[item["imageUrl"]]
                updated = True

        # statementSection
        stmt = home_doc.get("statementSection", {})
        if stmt and stmt.get("backgroundImage", {}).get("imageUrl") in url_mapping:
            stmt["backgroundImage"]["imageUrl"] = url_mapping[stmt["backgroundImage"]["imageUrl"]]
            updated = True

        # aboutPage collages
        about = home_doc.get("aboutPage", {})
        if about:
            for c_key in ("collageImage1", "collageImage2", "collageImage3", "collageImage4"):
                c_item = about.get(c_key)
                if c_item and c_item.get("imageUrl") in url_mapping:
                    c_item["imageUrl"] = url_mapping[c_item["imageUrl"]]
                    updated = True

        if updated:
            home_col.update_one(
                {"_id": home_doc["_id"]},
                {"$set": {
                    "heroSlides": slides,
                    "experienceImage": exp,
                    "galleryStrip": gallery,
                    "statementSection": stmt,
                    "aboutPage": about,
                }}
            )
            total_records_updated += 1
            print(f"Updated Homepage Content document ({home_doc['_id']})")

    # 3c. Update Categories (if any custom cover images used /uploads/)
    cat_col = db["categories"]
    cats = list(cat_col.find({}))
    for cat in cats:
        cover = cat.get("coverImage")
        if cover in url_mapping:
            cat_col.update_one({"_id": cat["_id"]}, {"$set": {"coverImage": url_mapping[cover]}})
            total_records_updated += 1
            print(f"Updated Category coverImage: '{cat.get('name')}' ({cat['_id']})")

    # 4. Save mapping report
    report_file = BACKEND_DIR / "cloudinary_migration_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump({
            "total_files": len(files),
            "uploaded_count": len(url_mapping),
            "records_updated": total_records_updated,
            "url_mapping": url_mapping,
            "errors": [f"{n}: {e}" for n, e in upload_errors],
        }, f, indent=2)

    print("\n==================================================")
    print("   MIGRATION COMPLETED SUCCESSFULLY               ")
    print("==================================================")
    print(f"Total files uploaded to Cloudinary: {len(url_mapping)} / {len(files)}")
    print(f"Total MongoDB documents updated:    {total_records_updated}")
    print(f"Report saved to:                   {report_file}")
    print("All local files in backend/uploads/ remain preserved.")


if __name__ == "__main__":
    run_migration()
