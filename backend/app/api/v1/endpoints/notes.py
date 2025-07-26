from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.security import HTTPBearer
from app.models.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse
from app.repositories.note_repository import NoteRepository
from app.config.cloudinary import CloudinaryService
from app.db.mongodb import get_database
from app.api.dependencies import get_current_user
from app.models.user import UserBase
import math

router = APIRouter()
security = HTTPBearer()


@router.post("/upload", response_model=NoteResponse)
async def upload_note(
    title: str = Form(..., min_length=1, max_length=200),
    description: Optional[str] = Form(None, max_length=1000),
    file: UploadFile = File(...),
    current_user: UserBase = Depends(get_current_user),
    db = Depends(get_database)
):
    """Upload a PDF note to Cloudinary and store metadata in database"""
    
    # Validate file type
    if not file.content_type == "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Validate file size (e.g., max 50MB)
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum 50MB allowed."
        )
    
    try:
        # Upload to Cloudinary
        cloudinary_result = await CloudinaryService.upload_pdf(
            file_content, 
            file.filename.replace(".pdf", ""),
            folder="notes"
        )
        
        pdf_url, public_id, thumbnail_url = cloudinary_result
        
        if not pdf_url or not public_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file to Cloudinary"
            )
        
        # Create note data
        note_data = NoteCreate(title=title, description=description)
        
        # Save to database
        note_repo = NoteRepository(db)
        note = await note_repo.create_note(
            note_data=note_data,
            cloudinary_url=pdf_url,
            cloudinary_public_id=public_id,
            thumbnail_url=thumbnail_url,
            file_size=len(file_content),
            uploaded_by=str(current_user.id)
        )
        
        return NoteResponse(
            _id=str(note.id),
            title=note.title,
            description=note.description,
            cloudinary_url=note.cloudinary_url,
            cloudinary_public_id=note.cloudinary_public_id,
            thumbnail_url=note.thumbnail_url,
            file_size=note.file_size,
            uploaded_by=note.uploaded_by,
            created_at=note.created_at,
            updated_at=note.updated_at,
            is_active=note.is_active
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload note: {str(e)}"
        )


@router.get("/", response_model=NoteListResponse)
async def get_notes(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    db = Depends(get_database)
):
    """Get paginated list of notes"""
    
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 10
    
    skip = (page - 1) * page_size
    
    note_repo = NoteRepository(db)
    
    # Get notes and total count
    notes = await note_repo.get_notes(skip=skip, limit=page_size, search=search)
    total = await note_repo.count_notes(search=search)
    total_pages = math.ceil(total / page_size)
    
    note_responses = [
        NoteResponse(
            _id=str(note.id),
            title=note.title,
            description=note.description,
            cloudinary_url=note.cloudinary_url,
            cloudinary_public_id=note.cloudinary_public_id,
            thumbnail_url=note.thumbnail_url,
            file_size=note.file_size,
            uploaded_by=note.uploaded_by,
            created_at=note.created_at,
            updated_at=note.updated_at,
            is_active=note.is_active
        ) for note in notes
    ]
    
    return NoteListResponse(
        notes=note_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    db = Depends(get_database)
):
    """Get a specific note by ID"""
    
    note_repo = NoteRepository(db)
    note = await note_repo.get_note_by_id(note_id)
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return NoteResponse(
        _id=str(note.id),
        title=note.title,
        description=note.description,
        cloudinary_url=note.cloudinary_url,
        cloudinary_public_id=note.cloudinary_public_id,
        thumbnail_url=note.thumbnail_url,
        file_size=note.file_size,
        uploaded_by=note.uploaded_by,
        created_at=note.created_at,
        updated_at=note.updated_at,
        is_active=note.is_active
    )


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_update: NoteUpdate,
    current_user: UserBase = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a note (title, description, or status)"""
    
    note_repo = NoteRepository(db)
    
    # Check if note exists and user has permission
    existing_note = await note_repo.get_note_by_id(note_id)
    if not existing_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Allow update if user is the uploader or admin
    if existing_note.uploaded_by != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this note"
        )
    
    updated_note = await note_repo.update_note(note_id, note_update)
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update note"
        )
    
    return NoteResponse(
        _id=str(updated_note.id),
        title=updated_note.title,
        description=updated_note.description,
        cloudinary_url=updated_note.cloudinary_url,
        cloudinary_public_id=updated_note.cloudinary_public_id,
        thumbnail_url=updated_note.thumbnail_url,
        file_size=updated_note.file_size,
        uploaded_by=updated_note.uploaded_by,
        created_at=updated_note.created_at,
        updated_at=updated_note.updated_at,
        is_active=updated_note.is_active
    )


@router.delete("/{note_id}")
async def delete_note(
    note_id: str,
    current_user: UserBase = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a note (soft delete)"""
    
    note_repo = NoteRepository(db)
    
    # Check if note exists and user has permission
    existing_note = await note_repo.get_note_by_id(note_id)
    if not existing_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Allow deletion if user is the uploader or admin
    if existing_note.uploaded_by != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this note"
        )
    
    success = await note_repo.delete_note(note_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete note"
        )
    
    return {"message": "Note deleted successfully"}


@router.get("/user/{user_id}", response_model=NoteListResponse)
async def get_user_notes(
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    current_user: UserBase = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get notes uploaded by a specific user"""
    
    # Allow access if requesting own notes or admin
    if user_id != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these notes"
        )
    
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 10
    
    skip = (page - 1) * page_size
    
    note_repo = NoteRepository(db)
    notes = await note_repo.get_notes_by_user(user_id, skip=skip, limit=page_size)
    
    # Count total notes for the user
    total = await note_repo.count_notes()  # This would need to be modified to count by user
    total_pages = math.ceil(total / page_size)
    
    note_responses = [
        NoteResponse(
            _id=str(note.id),
            title=note.title,
            description=note.description,
            cloudinary_url=note.cloudinary_url,
            cloudinary_public_id=note.cloudinary_public_id,
            thumbnail_url=note.thumbnail_url,
            file_size=note.file_size,
            uploaded_by=note.uploaded_by,
            created_at=note.created_at,
            updated_at=note.updated_at,
            is_active=note.is_active
        ) for note in notes
    ]
    
    return NoteListResponse(
        notes=note_responses,
        total=len(note_responses),  # For now, return actual count
        page=page,
        page_size=page_size,
        total_pages=1  # For simplicity
    )
