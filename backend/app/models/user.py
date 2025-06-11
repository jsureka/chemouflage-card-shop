from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            json_schema=core_schema.str_schema(),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

# User models
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    
class UserCreate(UserBase):
    password: str
    
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class User(UserBase):
    id: str
    avatar_url: Optional[str] = None
    
    model_config = {
        "from_attributes": True
    }

# User Role models
class UserRoleBase(BaseModel):
    role: str = "customer"  # Default role is customer
    
class UserRoleCreate(UserRoleBase):
    user_id: str
    
class UserRoleInDB(UserRoleBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class UserRole(UserRoleBase):
    id: str
    user_id: str
    
    model_config = {
        "from_attributes": True
    }

# Token models
class Token(BaseModel):
    access_token: str
    refresh_token: str  # Added refresh token
    token_type: str = "bearer"
    user: Optional["UserProfile"] = None
    
class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[datetime] = None
    token_type: Optional[str] = None  # To distinguish between access and refresh tokens

# Add RefreshToken model for database storage
class RefreshToken(BaseModel):
    user_id: str
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_revoked: bool = False
    
    model_config = {
        "from_attributes": True
    }

# Profile models - Consolidated user profile
class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "customer"
    
    model_config = {
        "from_attributes": True
    }

# GoogleAuth
class GoogleLoginRequest(BaseModel):
    token: str
