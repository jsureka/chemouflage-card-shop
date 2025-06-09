from datetime import datetime
from typing import List, Optional

from app.db.mongodb import get_database
from app.models.contact import ContactMessage, ContactMessageCreate
from app.models.pagination import PaginatedResponse, PaginationParams
from bson import ObjectId


class ContactRepository:
    def __init__(self):
        self.db = None
        self.collection = None

    async def _get_collection(self):
        if self.collection is None:
            self.db = await get_database()
            self.collection = self.db.contact_messages
        return self.collection

    async def create_message(self, message_data: ContactMessageCreate) -> str:
        collection = await self._get_collection()
        message_dict = message_data.dict()
        message_dict["created_at"] = datetime.utcnow()
        message_dict["status"] = "new"
        
        result = await collection.insert_one(message_dict)
        return str(result.inserted_id)

    async def get_all_messages(self, pagination: PaginationParams, status_filter: Optional[str] = None) -> PaginatedResponse:
        collection = await self._get_collection()
        
        query = {}
        if status_filter:
            query["status"] = status_filter
        
        skip = (pagination.page - 1) * pagination.limit
        total_count = await collection.count_documents(query)
        cursor = collection.find(query).skip(skip).limit(pagination.limit).sort("created_at", -1)
        messages = []
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            messages.append(ContactMessage(**doc))
        
        return PaginatedResponse.create(
            items=messages,
            current_page=pagination.page,
            page_size=pagination.limit,
            total_items=total_count
        )

    async def update_message_status(self, message_id: str, status: str, admin_notes: Optional[str] = None) -> bool:
        collection = await self._get_collection()
        
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow()
        }
        
        if admin_notes is not None:
            update_data["admin_notes"] = admin_notes
        
        result = await collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": update_data}
        )
        
        return result.modified_count > 0

    async def delete_message(self, message_id: str) -> bool:
        collection = await self._get_collection()
        
        result = await collection.delete_one({"_id": ObjectId(message_id)})
        return result.deleted_count > 0


contact_repository = ContactRepository()
