from typing import Optional, List, Union
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum
from app.utils.url_validator import validate_media_url


class PriceDisplayMode(str, Enum):
    fixed_price = "fixed_price"
    price_on_request = "price_on_request"


class ProductAvailability(str, Enum):
    available = "Available"
    reserved = "Reserved"
    sold = "Sold"
    archived = "Archived"


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    category: str = Field("Chikankari", min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = None
    priceDisplayMode: PriceDisplayMode = PriceDisplayMode.price_on_request
    fabric: Optional[str] = None
    craftsmanship: Optional[str] = None
    color: Optional[str] = None
    occasion: Optional[str] = None
    sizes: List[str] = ["Free Size"]
    images: List[str] = []
    videos: List[str] = []
    featured: bool = False
    available: bool = True
    availability: ProductAvailability = ProductAvailability.available

    @field_validator("images", "videos", mode="before")
    @classmethod
    def clean_media_list(cls, v):
        if not v:
            return []
        if isinstance(v, list):
            return [validate_media_url(item) for item in v if isinstance(item, str) and item.strip()]
        return v

    @field_validator("category", mode="before")
    @classmethod
    def clean_category(cls, v):
        if not v or str(v).strip() == "All":
            return "Chikankari"
        return str(v).strip()

    @field_validator("price", mode="before")
    @classmethod
    def clean_price(cls, v):
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    @field_validator("availability", mode="before")
    @classmethod
    def clean_availability(cls, v):
        if not v:
            return ProductAvailability.available
        if isinstance(v, str):
            mapping = {
                "available": ProductAvailability.available,
                "reserved": ProductAvailability.reserved,
                "sold": ProductAvailability.sold,
                "archived": ProductAvailability.archived,
            }
            return mapping.get(v.strip().lower(), ProductAvailability.available)
        return v


class ProductCreate(ProductBase):
    slug: Optional[str] = None  # auto-generated from name if not provided


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    priceDisplayMode: Optional[PriceDisplayMode] = None
    fabric: Optional[str] = None
    craftsmanship: Optional[str] = None
    color: Optional[str] = None
    occasion: Optional[str] = None
    sizes: Optional[List[str]] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    featured: Optional[bool] = None
    available: Optional[bool] = None
    availability: Optional[ProductAvailability] = None

    @field_validator("category", mode="before")
    @classmethod
    def clean_update_category(cls, v):
        if v is None:
            return None
        if str(v).strip() == "All":
            return "Chikankari"
        return str(v).strip()

    @field_validator("price", mode="before")
    @classmethod
    def clean_update_price(cls, v):
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    @field_validator("images", "videos", mode="before")
    @classmethod
    def clean_update_media_list(cls, v):
        if v is None:
            return None
        if isinstance(v, list):
            return [validate_media_url(item) for item in v if isinstance(item, str) and item.strip()]
        return v

    @field_validator("availability", mode="before")
    @classmethod
    def clean_update_availability(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            mapping = {
                "available": ProductAvailability.available,
                "reserved": ProductAvailability.reserved,
                "sold": ProductAvailability.sold,
                "archived": ProductAvailability.archived,
            }
            return mapping.get(v.strip().lower(), ProductAvailability.available)
        return v


class ProductOut(ProductBase):
    id: str
    slug: str
    createdAt: datetime
    updatedAt: datetime
