from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum
import re


class AppointmentStatus(str, Enum):
    pending = "pending"
    contacted = "contacted"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    rescheduled = "rescheduled"


class AppointmentCity(str, Enum):
    lahore = "Lahore"
    islamabad = "Islamabad"
    rawalpindi = "Rawalpindi"
    peshawar = "Peshawar"


class AppointmentCreate(BaseModel):
    customerName: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: Optional[str] = None
    city: AppointmentCity
    preferredDate: str = Field(..., description="Date in YYYY-MM-DD format")
    preferredTime: str = Field(..., description="e.g. Afternoon (2:00 PM - 5:00 PM)")
    collection: str = Field(..., min_length=2, max_length=100)
    interestedPiece: Optional[str] = Field(None, max_length=200)
    productId: Optional[str] = None
    message: Optional[str] = Field(None, max_length=1000)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)]", "", v)
        if not re.match(r"^\+?[\d]{10,15}$", cleaned):
            raise ValueError("Invalid phone number")
        return v

    @field_validator("preferredDate")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        return v


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus
    adminNotes: Optional[str] = Field(None, max_length=1000)


class AppointmentOut(BaseModel):
    id: str
    customerName: str
    phone: str
    email: Optional[str]
    city: str
    preferredDate: str
    preferredTime: str
    collection: str
    interestedPiece: Optional[str]
    productId: Optional[str]
    message: Optional[str]
    status: AppointmentStatus
    adminNotes: Optional[str]
    createdAt: datetime
    updatedAt: datetime
