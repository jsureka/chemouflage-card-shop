from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class NoteModel(BaseModel):
    """Note model for MongoDB storage"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    cloudinary_url: str = Field(..., description="Cloudinary URL for the PDF file")
    cloudinary_public_id: str = Field(..., description="Cloudinary public ID for the file")
    thumbnail_url: Optional[str] = Field(None, description="Generated thumbnail URL from Cloudinary")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    uploaded_by: str = Field(..., description="User ID who uploaded the note")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class NoteCreate(BaseModel):
    """Schema for creating a new note"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class NoteUpdate(BaseModel):
    """Schema for updating an existing note"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None


class NoteResponse(BaseModel):
    """Schema for note response"""
    id: str = Field(..., alias="_id")
    title: str
    description: Optional[str]
    cloudinary_url: str
    cloudinary_public_id: str
    thumbnail_url: Optional[str]
    file_size: Optional[int]
    uploaded_by: str
    created_at: datetime
    updated_at: datetime
    is_active: bool

    class Config:
        populate_by_name = True


class NoteListResponse(BaseModel):
    """Schema for paginated note list response"""
    notes: list[NoteResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
