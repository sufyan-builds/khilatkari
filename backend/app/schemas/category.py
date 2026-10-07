from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from app.utils.url_validator import validate_media_url


class ImageFramingConfig(BaseModel):
    zoom: float = Field(default=1.0, ge=0.5, le=3.0)
    posX: float = Field(default=50.0, ge=0.0, le=100.0)
    posY: float = Field(default=0.0, ge=0.0, le=100.0)


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    coverImage: Optional[str] = None
    imagePosition: Optional[ImageFramingConfig] = None
    featuredOnHomepage: bool = False
    homepageDescription: Optional[str] = None
    homepageOrder: int = 0
    displayOrder: int = 0
    isActive: bool = True

    @field_validator("coverImage", mode="before")
    @classmethod
    def clean_cover_image(cls, v):
        return validate_media_url(v)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    coverImage: Optional[str] = None
    imagePosition: Optional[ImageFramingConfig] = None
    featuredOnHomepage: Optional[bool] = None
    homepageDescription: Optional[str] = None
    homepageOrder: Optional[int] = None
    displayOrder: Optional[int] = None
    isActive: Optional[bool] = None

    @field_validator("coverImage", mode="before")
    @classmethod
    def clean_update_cover_image(cls, v):
        return validate_media_url(v)


class CategoryOut(CategoryBase):
    id: str
    slug: str
    productCount: int = 0
    createdAt: datetime
    updatedAt: datetime


class ProductReassignRequest(BaseModel):
    sourceCategoryName: str
    targetCategoryName: str
