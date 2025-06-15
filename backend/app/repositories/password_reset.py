import secrets
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings
from app.db.mongodb import get_database
from app.models.password_reset import PasswordResetToken
from bson import ObjectId


class PasswordResetTokenRepository:
    @staticmethod
    async def create_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a password reset token for a user.
        """
        db = await get_database()
        
        # Generate secure token
        token = secrets.token_urlsafe(32)
        
        # Calculate expiration time
        if expires_delta:
            expires_at = datetime.utcnow() + expires_delta
        else:
            expires_at = datetime.utcnow() + timedelta(hours=settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
        
        # Create token document
        token_data = {
            "user_id": ObjectId(user_id),
            "token": token,
            "expires_at": expires_at,
            "created_at": datetime.utcnow(),
            "is_used": False
        }
        
        # First invalidate any existing tokens for this user
        await db.password_reset_tokens.update_many(
            {"user_id": ObjectId(user_id)},
            {"$set": {"is_used": True}}
        )
        
        # Create new token
        await db.password_reset_tokens.insert_one(token_data)
        
        return token
    
    @staticmethod
    async def get_by_token(token: str) -> Optional[PasswordResetToken]:
        """
        Get token details by token string.
        """
        db = await get_database()
        token_data = await db.password_reset_tokens.find_one({"token": token})
        
        if token_data:
            return PasswordResetToken(
                user_id=str(token_data["user_id"]),
                token=token_data["token"],
                expires_at=token_data["expires_at"],
                created_at=token_data["created_at"],
                is_used=token_data["is_used"]
            )
        return None
    
    @staticmethod
    async def mark_as_used(token: str) -> bool:
        """
        Mark a token as used after successful password reset.
        """
        db = await get_database()
        result = await db.password_reset_tokens.update_one(
            {"token": token},
            {"$set": {"is_used": True}}
        )
        return result.modified_count > 0
    
    @staticmethod
    async def is_token_valid(token: str) -> bool:
        """
        Check if a token is valid (exists, not expired, not used).
        """
        reset_token = await PasswordResetTokenRepository.get_by_token(token)
        if not reset_token:
            return False
            
        current_time = datetime.utcnow()
        if reset_token.expires_at < current_time or reset_token.is_used:
            return False
            
        return True
    
    @staticmethod
    async def cleanup_expired_tokens() -> int:
        """
        Remove tokens that have expired to keep the database clean.
        """
        db = await get_database()
        result = await db.password_reset_tokens.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        return result.deleted_count
