from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings
from app.db.mongodb import get_database
from app.models.user import RefreshToken
from bson import ObjectId


class RefreshTokenRepository:
    @staticmethod
    async def create(user_id: str, token: str, expires_delta: Optional[timedelta] = None) -> str:
        db = await get_database()
        
        # Calculate expiration time
        if expires_delta:
            expires_at = datetime.utcnow() + expires_delta
        else:
            expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Create refresh token document
        refresh_token = {
            "user_id": ObjectId(user_id),
            "token": token,
            "expires_at": expires_at,
            "created_at": datetime.utcnow(),
            "is_revoked": False
        }
        
        result = await db.refresh_tokens.insert_one(refresh_token)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_by_token(token: str) -> Optional[RefreshToken]:
        db = await get_database()
        token_data = await db.refresh_tokens.find_one({"token": token})
        
        if token_data:
            return RefreshToken(
                user_id=str(token_data["user_id"]),
                token=token_data["token"],
                expires_at=token_data["expires_at"],
                created_at=token_data["created_at"],
                is_revoked=token_data["is_revoked"]
            )
        return None
    
    @staticmethod
    async def revoke(token: str) -> bool:
        db = await get_database()
        result = await db.refresh_tokens.update_one(
            {"token": token},
            {"$set": {"is_revoked": True}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def revoke_all_for_user(user_id: str) -> int:
        db = await get_database()
        result = await db.refresh_tokens.update_many(
            {"user_id": ObjectId(user_id)},
            {"$set": {"is_revoked": True}}
        )
        return result.modified_count
    
    @staticmethod
    async def cleanup_expired_tokens() -> int:
        """Remove tokens that have expired to keep the database clean"""
        db = await get_database()
        result = await db.refresh_tokens.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        return result.deleted_count
    
    @staticmethod
    async def is_token_valid(token: str) -> bool:
        """Check if a token is valid (exists, not expired, not revoked)"""
        refresh_token = await RefreshTokenRepository.get_by_token(token)
        if not refresh_token:
            return False
            
        current_time = datetime.utcnow()
        if refresh_token.expires_at < current_time or refresh_token.is_revoked:
            return False
            
        return True
