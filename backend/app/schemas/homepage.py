from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.utils.url_validator import validate_media_url, validate_link_url


class ImagePositionConfig(BaseModel):
    id: Optional[str] = None
    mediaType: str = Field(default="image")  # "image" or "video"
    imageUrl: str = ""
    videoUrl: Optional[str] = None
    posterUrl: Optional[str] = None
    zoom: float = Field(default=1.0, ge=0.5, le=3.0)
    posX: float = Field(default=50.0, ge=0.0, le=100.0)
    posY: float = Field(default=20.0, ge=0.0, le=100.0)
    title: Optional[str] = None
    subtitle: Optional[str] = None
    tag: Optional[str] = None
    ctaText: Optional[str] = None
    ctaLink: Optional[str] = None

    @field_validator("imageUrl", "videoUrl", "posterUrl", mode="before")
    @classmethod
    def clean_media_urls(cls, v):
        return validate_media_url(v)

    @field_validator("ctaLink", mode="before")
    @classmethod
    def clean_cta_link(cls, v):
        return validate_link_url(v)


class AboutPageConfig(BaseModel):
    """CMS config for the About page — all business-facing content fields."""
    # Hero section
    heroHeadlineMain: Optional[str] = None     # e.g. "A Celebration of Authentic"
    heroHeadlineItalic: Optional[str] = None   # e.g. "South Asian Heritage"
    heroIntroText: Optional[str] = None        # Intro paragraph below the headline

    # Philosophy section
    philosophyHeadline: Optional[str] = None   # e.g. "Why We Operate Exclusively by Appointment"
    philosophyPara1: Optional[str] = None      # First body paragraph
    philosophyPara2: Optional[str] = None      # Second body paragraph (contains city names)
    philosophyPara3: Optional[str] = None      # Third body paragraph

    # Bottom CTA section
    ctaHeadline: Optional[str] = None          # e.g. "Experience the Collection Firsthand"
    ctaBodyText: Optional[str] = None          # CTA sub-description paragraph

    # 4-slot collage — each independently configurable with zoom/pan
    collageImage1: Optional[ImagePositionConfig] = None
    collageImage2: Optional[ImagePositionConfig] = None
    collageImage3: Optional[ImagePositionConfig] = None
    collageImage4: Optional[ImagePositionConfig] = None


class CollectionsPageConfig(BaseModel):
    """CMS config for the Collections page header."""
    label: Optional[str] = None        # e.g. "Private Lookbook"
    heading: Optional[str] = None      # e.g. "The Collection"
    description: Optional[str] = None  # e.g. "Each piece is handcrafted..."


class StatementSectionConfig(BaseModel):
    """CMS config for the 'Statement Piece' CTA section on the homepage."""
    backgroundImage: Optional[ImagePositionConfig] = None  # bg image + zoom/pan
    headlineMain: Optional[str] = None    # e.g. "Discover Your Next"
    headlineItalic: Optional[str] = None  # e.g. "Statement Piece."
    bodyText: Optional[str] = None        # paragraph text
    button1Text: Optional[str] = None     # e.g. "Book a Private Appointment"
    button1Link: Optional[str] = None     # e.g. "/appointments"
    button2Text: Optional[str] = None     # e.g. "Chat on WhatsApp"
    button2Link: Optional[str] = None     # WhatsApp URL or custom link; falls back to WhatsApp if empty

    @field_validator("button1Link", "button2Link", mode="before")
    @classmethod
    def clean_button_links(cls, v):
        return validate_link_url(v)


class HomepageContentConfig(BaseModel):
    heroSlides: List[ImagePositionConfig] = []
    experienceImage: ImagePositionConfig
    galleryStrip: List[ImagePositionConfig] = []
    # CMS sections
    statementSection: Optional[StatementSectionConfig] = None
    aboutPage: Optional[AboutPageConfig] = None
    collectionsPage: Optional[CollectionsPageConfig] = None
    updatedAt: Optional[str] = None


class HomepageContentUpdate(BaseModel):
    heroSlides: Optional[List[ImagePositionConfig]] = None
    experienceImage: Optional[ImagePositionConfig] = None
    galleryStrip: Optional[List[ImagePositionConfig]] = None
    # CMS sections
    statementSection: Optional[StatementSectionConfig] = None
    aboutPage: Optional[AboutPageConfig] = None
    collectionsPage: Optional[CollectionsPageConfig] = None
    expectedUpdatedAt: Optional[str] = None
