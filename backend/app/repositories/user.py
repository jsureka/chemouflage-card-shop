from datetime import datetime
from typing import List, Optional

from app.core.security import get_password_hash, verify_password
from app.db.mongodb import get_database
from app.models.user import (FirebaseUserCreate, PyObjectId, User, UserCreate,
                             UserInDB, UserProfile, UserRole, UserRoleCreate,
                             UserRoleInDB, UserUpdate)
from bson import ObjectId


class UserRepository:
    @staticmethod
    async def create(user: UserCreate) -> str:
        db = await get_database()
        
        # Check if user already exists
        if await db.users.find_one({"email": user.email.lower()}):
            raise ValueError("Email already registered")
        
        # Create the user
        user_dict = user.model_dump()
        hashed_password = get_password_hash(user_dict.pop("password"))
        user_dict["email"] = user_dict["email"].lower()
        user_dict["hashed_password"] = hashed_password
        user_dict["created_at"] = datetime.utcnow()
        user_dict["email_verified"] = False  # Default for regular users
        
        result = await db.users.insert_one(user_dict)
        user_id = result.inserted_id
        
        # Create default role for the user
        role = UserRoleCreate(user_id=str(user_id), role="customer")
        await UserRoleRepository.create(role)
        
        return str(user_id)
    
    @staticmethod
    async def create_firebase_user(firebase_user: FirebaseUserCreate) -> str:
        """Create a user from Firebase authentication data"""
        db = await get_database()
        
        # Check if user already exists by email
        existing_user = await db.users.find_one({"email": firebase_user.email.lower()})
        if existing_user:
            # Update Firebase UID if not set
            if not existing_user.get("firebase_uid"):
                await db.users.update_one(
                    {"_id": existing_user["_id"]},
                    {"$set": {"firebase_uid": firebase_user.firebase_uid, "updated_at": datetime.utcnow()}}
                )
            return str(existing_user["_id"])
        
        # Check if Firebase user already exists
        existing_firebase_user = await db.users.find_one({"firebase_uid": firebase_user.firebase_uid})
        if existing_firebase_user:
            return str(existing_firebase_user["_id"])
        
        # Create new Firebase user
        user_dict = firebase_user.model_dump()
        user_dict["email"] = user_dict["email"].lower()
        user_dict["created_at"] = datetime.utcnow()
        # No hashed_password for Firebase users
        
        result = await db.users.insert_one(user_dict)
        user_id = result.inserted_id
          # Create default role for the user
        role = UserRoleCreate(user_id=str(user_id), role="customer")
        await UserRoleRepository.create(role)
        
        return str(user_id)
    
    @staticmethod
    async def get_by_id(user_id: str) -> Optional[User]:
        db = await get_database()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            return User(
                **{k: v for k, v in user.items() if k != 'hashed_password'}, 
                id=str(user["_id"]),
                firebase_uid=user.get("firebase_uid"),
                email_verified=user.get("email_verified", False)
            )
        return None
    
    @staticmethod
    async def get_by_email(email: str) -> Optional[UserInDB]:
        db = await get_database()
        user = await db.users.find_one({"email": email.lower()})
        if user:
            return UserInDB(**user, id=str(user["_id"]))
        return None
    
    @staticmethod
    async def get_by_firebase_uid(firebase_uid: str) -> Optional[UserInDB]:
        db = await get_database()
        user = await db.users.find_one({"firebase_uid": firebase_uid})
        if user:
            return UserInDB(**user, id=str(user["_id"]))
        return None
    
    @staticmethod
    async def authenticate(email: str, password: str) -> Optional[User]:
        user = await UserRepository.get_by_email(email)
        if not user:
            return None
        
        # Skip password verification for Firebase users (they don't have hashed_password)
        if user.firebase_uid:
            return User(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                phone=user.phone,
                avatar_url=user.avatar_url,
                firebase_uid=user.firebase_uid,
                email_verified=user.email_verified
            )
        
        # For regular users, verify password
        if not user.hashed_password or not verify_password(password, user.hashed_password):
            return None
        
        return User(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            firebase_uid=user.firebase_uid,
            email_verified=user.email_verified
        )
    
    @staticmethod
    async def authenticate_firebase(firebase_uid: str) -> Optional[User]:
        """Authenticate user by Firebase UID"""
        user = await UserRepository.get_by_firebase_uid(firebase_uid)
        if not user:
            return None
        return User(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            firebase_uid=user.firebase_uid,
            email_verified=user.email_verified
        )
    
    @staticmethod
    async def update(user_id: str, user_update: UserUpdate) -> Optional[User]:
        db = await get_database()
        update_data = {k: v for k, v in user_update.model_dump(exclude_unset=True).items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        if update_data:
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
        
        return await UserRepository.get_by_id(user_id)
    
    @staticmethod
    async def update_password(user_id: str, new_password: str) -> bool:
        db = await get_database()
        hashed_password = get_password_hash(new_password)
        result = await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"hashed_password": hashed_password, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100) -> List[User]:
        db = await get_database()
        cursor = db.users.find().skip(skip).limit(limit)
        users = []
        async for doc in cursor:            users.append(User(
                id=str(doc["_id"]),
                email=doc["email"],
                full_name=doc.get("full_name"),
                phone=doc.get("phone"),
                avatar_url=doc.get("avatar_url"),
                firebase_uid=doc.get("firebase_uid"),
                email_verified=doc.get("email_verified", False)
            ))
        return users
    
    @staticmethod
    async def delete(user_id: str) -> bool:
        db = await get_database()
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count > 0:
            # Also delete any user roles
            await db.user_roles.delete_many({"user_id": ObjectId(user_id)})
            return True
        return False
    
    @staticmethod
    async def count() -> int:
        db = await get_database()
        return await db.users.count_documents({})
    
    @staticmethod
    async def get_profile(user_id: str) -> Optional[UserProfile]:
        db = await get_database()
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None
        
        # Get user role
        role = await UserRoleRepository.get_by_user_id(user_id)
        role_name = role.role if role else "customer"
        
        return UserProfile(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user.get("full_name"),
            phone=user.get("phone"),
            avatar_url=user.get("avatar_url"),
            firebase_uid=user.get("firebase_uid"),
            email_verified=user.get("email_verified", False),
            role=role_name
        )


class UserRoleRepository:
    @staticmethod
    async def create(user_role: UserRoleCreate) -> str:
        db = await get_database()
        
        # Check if a role already exists for this user
        existing_role = await db.user_roles.find_one({"user_id": ObjectId(user_role.user_id)})
        if existing_role:
            # If exists, update it
            result = await db.user_roles.update_one(
                {"user_id": ObjectId(user_role.user_id)},
                {"$set": {"role": user_role.role}}
            )
            return str(existing_role["_id"])
        
        # Otherwise create a new role
        role_dict = user_role.model_dump()
        role_dict["user_id"] = ObjectId(role_dict["user_id"])
        role_dict["created_at"] = datetime.utcnow()
        
        result = await db.user_roles.insert_one(role_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_by_id(role_id: str) -> Optional[UserRole]:
        db = await get_database()
        role = await db.user_roles.find_one({"_id": ObjectId(role_id)})
        if role:
            return UserRole(
                id=str(role["_id"]),
                user_id=str(role["user_id"]),
                role=role["role"]
            )
        return None
    
    @staticmethod
    async def get_by_user_id(user_id: str) -> Optional[UserRole]:
        db = await get_database()
        role = await db.user_roles.find_one({"user_id": ObjectId(user_id)})
        if role:
            return UserRole(
                id=str(role["_id"]),
                user_id=str(role["user_id"]),
                role=role["role"]
            )
        return None
    
    @staticmethod
    async def update(user_id: str, role: str) -> bool:
        db = await get_database()
        result = await db.user_roles.update_one(
            {"user_id": ObjectId(user_id)},
            {"$set": {"role": role}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def is_admin(user_id: str) -> bool:
        role = await UserRoleRepository.get_by_user_id(user_id)
        return role is not None and role.role == "admin"
