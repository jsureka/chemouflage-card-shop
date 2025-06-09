from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class ContactMessage(BaseModel):
    """Contact message model"""
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: Optional[datetime] = None
    status: str = "new"  # new, read, replied
    admin_notes: Optional[str] = None


class ContactMessageCreate(BaseModel):
    """Contact message creation model"""
    name: str
    email: EmailStr
    subject: str
    message: str


class ContactMessageResponse(BaseModel):
    """Contact message response model"""
    id: str
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime
    status: str
    admin_notes: Optional[str] = None
