import secrets
import string
from datetime import datetime
from typing import List, Optional

from app.db.mongodb import get_database
from app.models.product import (PremiumCode, PremiumCodeBind,
                                PremiumCodeCreate, PremiumCodeGenerate,
                                PremiumCodeInDB, PremiumCodeUpdate)
from app.repositories.user import UserRepository
from bson import ObjectId


class PremiumCodeRepository:
    @staticmethod
    def _generate_code(length: int = 12) -> str:
        """Generate a random premium code."""
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    @staticmethod
    async def create(premium_code: PremiumCodeCreate) -> str:
        """Create a single premium code."""
        db = await get_database()
        
        # Generate unique code
        code = PremiumCodeRepository._generate_code()
        while await db.premium_codes.find_one({"code": code}):
            code = PremiumCodeRepository._generate_code()
        
        premium_code_dict = premium_code.model_dump()
        premium_code_dict["code"] = code
        premium_code_dict["created_at"] = datetime.utcnow()
        premium_code_dict["used_count"] = 0
        
        result = await db.premium_codes.insert_one(premium_code_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def generate_bulk(generate_request: PremiumCodeGenerate) -> List[str]:
        """Generate multiple premium codes."""
        db = await get_database()
        created_ids = []
        
        for _ in range(generate_request.count):
            # Generate unique code
            code = PremiumCodeRepository._generate_code()
            while await db.premium_codes.find_one({"code": code}):
                code = PremiumCodeRepository._generate_code()
            
            premium_code_dict = {
                "code": code,
                "description": generate_request.description,
                "is_active": True,
                "usage_limit": generate_request.usage_limit,
                "expires_at": generate_request.expires_at,
                "used_count": 0,
                "created_at": datetime.utcnow(),
                "bound_user_id": None
            }
            
            result = await db.premium_codes.insert_one(premium_code_dict)
            created_ids.append(str(result.inserted_id))
        
        return created_ids
    
    @staticmethod
    async def get_by_id(code_id: str) -> Optional[PremiumCode]:
        """Get premium code by ID."""
        db = await get_database()
        code_doc = await db.premium_codes.find_one({"_id": ObjectId(code_id)})
        
        if not code_doc:
            return None
        
        # Get bound user email if exists
        bound_user_email = None
        if code_doc.get("bound_user_id"):
            user = await UserRepository.get_by_id(code_doc["bound_user_id"])
            if user:
                bound_user_email = user.email
        
        return PremiumCode(
            **code_doc,
            id=str(code_doc["_id"]),
            bound_user_email=bound_user_email
        )
    
    @staticmethod
    async def get_by_code(code: str) -> Optional[PremiumCode]:
        """Get premium code by code value."""
        db = await get_database()
        code_doc = await db.premium_codes.find_one({"code": code})
        
        if not code_doc:
            return None
        
        # Get bound user email if exists
        bound_user_email = None
        if code_doc.get("bound_user_id"):
            user = await UserRepository.get_by_id(code_doc["bound_user_id"])
            if user:
                bound_user_email = user.email
        
        return PremiumCode(
            **code_doc,
            id=str(code_doc["_id"]),
            bound_user_email=bound_user_email
        )
    
    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100) -> List[PremiumCode]:
        """Get all premium codes with pagination."""
        db = await get_database()
        cursor = db.premium_codes.find().skip(skip).limit(limit).sort("created_at", -1)
        
        codes = []
        async for doc in cursor:
            # Get bound user email if exists
            bound_user_email = None
            if doc.get("bound_user_id"):
                user = await UserRepository.get_by_id(doc["bound_user_id"])
                if user:
                    bound_user_email = user.email
            
            codes.append(PremiumCode(
                **doc,
                id=str(doc["_id"]),
                bound_user_email=bound_user_email
            ))
        
        return codes
    
    @staticmethod
    async def get_by_user(user_id: str) -> List[PremiumCode]:
        """Get premium codes bound to a specific user."""
        db = await get_database()
        cursor = db.premium_codes.find({"bound_user_id": user_id}).sort("created_at", -1)
        
        codes = []
        async for doc in cursor:
            user = await UserRepository.get_by_id(user_id)
            bound_user_email = user.email if user else None
            
            codes.append(PremiumCode(
                **doc,
                id=str(doc["_id"]),
                bound_user_email=bound_user_email
            ))
        
        return codes
    
    @staticmethod
    async def bind_to_user(code_id: str, bind_request: PremiumCodeBind) -> Optional[PremiumCode]:
        """Bind a premium code to a user."""
        db = await get_database()
        
        # Find user by email
        user = await UserRepository.get_by_email(bind_request.user_email)
        if not user:
            raise ValueError(f"User with email {bind_request.user_email} not found")
        
        # Update the premium code
        update_data = {
            "bound_user_id": user.id,
            "updated_at": datetime.utcnow()
        }
        
        result = await db.premium_codes.update_one(
            {"_id": ObjectId(code_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await PremiumCodeRepository.get_by_id(code_id)
    
    @staticmethod
    async def unbind_from_user(code_id: str) -> Optional[PremiumCode]:
        """Unbind a premium code from a user."""
        db = await get_database()
        
        update_data = {
            "bound_user_id": None,
            "updated_at": datetime.utcnow()
        }
        
        result = await db.premium_codes.update_one(
            {"_id": ObjectId(code_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await PremiumCodeRepository.get_by_id(code_id)
    
    @staticmethod
    async def update(code_id: str, code_update: PremiumCodeUpdate) -> Optional[PremiumCode]:
        """Update a premium code."""
        db = await get_database()
        
        update_data = {k: v for k, v in code_update.model_dump(exclude_unset=True).items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        if update_data:
            await db.premium_codes.update_one(
                {"_id": ObjectId(code_id)},
                {"$set": update_data}
            )
        
        return await PremiumCodeRepository.get_by_id(code_id)
    
    @staticmethod
    async def delete(code_id: str) -> bool:
        """Delete a premium code."""
        db = await get_database()
        result = await db.premium_codes.delete_one({"_id": ObjectId(code_id)})
        return result.deleted_count > 0
    
    @staticmethod
    async def use_code(code: str, user_id: str) -> bool:
        """Use a premium code (increment usage count)."""
        db = await get_database()
        
        # Check if code exists and is valid
        code_doc = await db.premium_codes.find_one({"code": code})
        if not code_doc:
            return False
        
        # Check if code is active
        if not code_doc.get("is_active", True):
            return False
        
        # Check if code has expired
        if code_doc.get("expires_at") and code_doc["expires_at"] < datetime.utcnow():
            return False
        
        # Check if code has reached usage limit
        usage_limit = code_doc.get("usage_limit")
        if usage_limit and code_doc.get("used_count", 0) >= usage_limit:
            return False
        
        # Check if code is bound to a specific user
        if code_doc.get("bound_user_id") and code_doc["bound_user_id"] != user_id:
            return False
        
        # Increment usage count
        result = await db.premium_codes.update_one(
            {"_id": code_doc["_id"]},
            {
                "$inc": {"used_count": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return result.modified_count > 0
    
    @staticmethod
    async def count() -> int:
        """Count total premium codes."""
        db = await get_database()
        return await db.premium_codes.count_documents({})
    
    @staticmethod
    async def count_active() -> int:
        """Count active premium codes."""
        db = await get_database()
        return await db.premium_codes.count_documents({"is_active": True})
    
    @staticmethod
    async def count_bound() -> int:
        """Count premium codes bound to users."""
        db = await get_database()
        return await db.premium_codes.count_documents({"bound_user_id": {"$ne": None}})
