from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.note import NoteModel, NoteCreate, NoteUpdate


class NoteRepository:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.notes

    async def create_note(self, note_data: NoteCreate, cloudinary_url: str, 
                         cloudinary_public_id: str, thumbnail_url: str, 
                         file_size: int, uploaded_by: str) -> NoteModel:
        """Create a new note"""
        note_dict = {
            "title": note_data.title,
            "description": note_data.description,
            "cloudinary_url": cloudinary_url,
            "cloudinary_public_id": cloudinary_public_id,
            "thumbnail_url": thumbnail_url,
            "file_size": file_size,
            "uploaded_by": uploaded_by,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = await self.collection.insert_one(note_dict)
        note_dict["_id"] = result.inserted_id
        return NoteModel(**note_dict)

    async def get_notes(self, skip: int = 0, limit: int = 10, 
                       search: Optional[str] = None, 
                       is_active: Optional[bool] = True) -> List[NoteModel]:
        """Get notes with pagination and optional search"""
        query = {}
        
        if is_active is not None:
            query["is_active"] = is_active
            
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        notes = await cursor.to_list(length=limit)
        return [NoteModel(**note) for note in notes]

    async def count_notes(self, search: Optional[str] = None, 
                         is_active: Optional[bool] = True) -> int:
        """Count total notes with optional filters"""
        query = {}
        
        if is_active is not None:
            query["is_active"] = is_active
            
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        return await self.collection.count_documents(query)

    async def get_note_by_id(self, note_id: str) -> Optional[NoteModel]:
        """Get a note by ID"""
        if not ObjectId.is_valid(note_id):
            return None
            
        note = await self.collection.find_one({"_id": ObjectId(note_id)})
        return NoteModel(**note) if note else None

    async def update_note(self, note_id: str, note_update: NoteUpdate) -> Optional[NoteModel]:
        """Update a note"""
        if not ObjectId.is_valid(note_id):
            return None
            
        update_data = {}
        if note_update.title is not None:
            update_data["title"] = note_update.title
        if note_update.description is not None:
            update_data["description"] = note_update.description
        if note_update.is_active is not None:
            update_data["is_active"] = note_update.is_active
            
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await self.collection.update_one(
                {"_id": ObjectId(note_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await self.get_note_by_id(note_id)
        
        return None

    async def delete_note(self, note_id: str) -> bool:
        """Soft delete a note (set is_active to False)"""
        if not ObjectId.is_valid(note_id):
            return False
            
        result = await self.collection.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0

    async def hard_delete_note(self, note_id: str) -> bool:
        """Permanently delete a note from database"""
        if not ObjectId.is_valid(note_id):
            return False
            
        result = await self.collection.delete_one({"_id": ObjectId(note_id)})
        return result.deleted_count > 0

    async def get_notes_by_user(self, user_id: str, skip: int = 0, limit: int = 10) -> List[NoteModel]:
        """Get notes uploaded by a specific user"""
        cursor = (self.collection.find({"uploaded_by": user_id, "is_active": True})
                 .sort("created_at", -1)
                 .skip(skip)
                 .limit(limit))
        notes = await cursor.to_list(length=limit)
        return [NoteModel(**note) for note in notes]
