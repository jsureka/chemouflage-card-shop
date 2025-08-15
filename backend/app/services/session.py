"""
Session management service using Redis for user sessions and authentication tokens.
Provides secure session storage, token blacklisting, and rate limiting.
"""
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from app.core.config import settings
from app.services.cache import cache_service

logger = logging.getLogger(__name__)

class SessionService:
    """Service for managing user sessions and authentication tokens."""
    
    def __init__(self):
        self.session_prefix = "session:"
        self.token_blacklist_prefix = "blacklist:"
        self.rate_limit_prefix = "rate_limit:"
    
    async def create_session(
        self, 
        user_id: str, 
        session_data: Dict[str, Any],
        expires_in: Optional[int] = None
    ) -> str:
        """
        Create a new user session.
        
        Args:
            user_id: User ID
            session_data: Session data to store
            expires_in: Session expiration time in seconds
            
        Returns:
            Session ID
        """
        session_id = f"{user_id}_{datetime.utcnow().timestamp()}"
        
        # Add metadata
        session_data.update({
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat(),
            "session_id": session_id
        })
        
        # Store session
        ttl = expires_in or settings.CACHE_TTL_USER_SESSIONS
        await cache_service.set(
            f"{self.session_prefix}{session_id}",
            session_data,
            ttl=ttl
        )
        
        # Also store user -> session mapping
        await cache_service.set(
            f"user_session:{user_id}",
            session_id,
            ttl=ttl
        )
        
        logger.info(f"Created session {session_id} for user {user_id}")
        return session_id
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data by session ID."""
        session_data = await cache_service.get(f"{self.session_prefix}{session_id}")
        
        if session_data and isinstance(session_data, dict):
            # Update last activity
            session_data["last_activity"] = datetime.utcnow().isoformat()
            await cache_service.set(
                f"{self.session_prefix}{session_id}",
                session_data,
                ttl=settings.CACHE_TTL_USER_SESSIONS
            )
            return session_data
        
        return None
    
    async def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get active session for a user."""
        session_id = await cache_service.get(f"user_session:{user_id}")
        if session_id:
            return await self.get_session(session_id)
        return None
    
    async def update_session(
        self, 
        session_id: str, 
        session_data: Dict[str, Any]
    ) -> bool:
        """Update session data."""
        existing_session = await cache_service.get(f"{self.session_prefix}{session_id}")
        if existing_session and isinstance(existing_session, dict):
            # Merge data
            existing_session.update(session_data)
            existing_session["last_activity"] = datetime.utcnow().isoformat()
            
            return await cache_service.set(
                f"{self.session_prefix}{session_id}",
                existing_session,
                ttl=settings.CACHE_TTL_USER_SESSIONS
            )
        return False
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        session_data = await cache_service.get(f"{self.session_prefix}{session_id}")
        if session_data and isinstance(session_data, dict):
            user_id = session_data.get("user_id")
            
            # Delete session
            await cache_service.delete(f"{self.session_prefix}{session_id}")
            
            # Delete user session mapping
            if user_id:
                await cache_service.delete(f"user_session:{user_id}")
            
            logger.info(f"Deleted session {session_id}")
            return True
        return False
    
    async def delete_user_sessions(self, user_id: str) -> bool:
        """Delete all sessions for a user."""
        session_id = await cache_service.get(f"user_session:{user_id}")
        if session_id:
            await self.delete_session(session_id)
            return True
        return False
    
    async def extend_session(self, session_id: str, extend_by: int = None) -> bool:
        """Extend session TTL."""
        session_data = await cache_service.get(f"{self.session_prefix}{session_id}")
        if session_data:
            ttl = extend_by or settings.CACHE_TTL_USER_SESSIONS
            return await cache_service.set(
                f"{self.session_prefix}{session_id}",
                session_data,
                ttl=ttl
            )
        return False
    
    async def blacklist_token(self, token: str, expires_in: int = None) -> bool:
        """
        Add a token to the blacklist.
        
        Args:
            token: JWT token to blacklist
            expires_in: Blacklist expiration time
        """
        ttl = expires_in or settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        return await cache_service.set(
            f"{self.token_blacklist_prefix}{token}",
            {"blacklisted_at": datetime.utcnow().isoformat()},
            ttl=ttl
        )
    
    async def is_token_blacklisted(self, token: str) -> bool:
        """Check if a token is blacklisted."""
        return await cache_service.exists(f"{self.token_blacklist_prefix}{token}")
    
    async def check_rate_limit(
        self, 
        identifier: str, 
        limit: int, 
        window_seconds: int,
        action: str = "request"
    ) -> tuple[bool, int, int]:
        """
        Check rate limit for an identifier.
        
        Args:
            identifier: Unique identifier (user_id, IP, etc.)
            limit: Maximum number of requests
            window_seconds: Time window in seconds
            action: Action type for logging
            
        Returns:
            (is_allowed, current_count, ttl_seconds)
        """
        key = f"{self.rate_limit_prefix}{identifier}:{action}"

        # Use Redis atomic increment to update the counter. This ensures we don't
        # overwrite the key's TTL on every request which previously caused the
        # remaining window time to reset, effectively disabling the rate limit.
        redis_manager = await cache_service._get_redis()
        new_count = await redis_manager.increment(key, 1)

        # If Redis isn't available, allow the request
        if new_count is None:
            return True, 0, window_seconds

        # When the key is created (count is 1), set the expiration window
        if new_count == 1:
            await redis_manager.redis.expire(key, window_seconds)

        # Check if limit exceeded
        is_allowed = new_count <= limit

        # Get remaining TTL for the key
        ttl = await redis_manager.get_ttl(key)
        if ttl is None or ttl < 0:
            ttl = window_seconds

        if not is_allowed:
            logger.warning(f"Rate limit exceeded for {identifier}: {new_count}/{limit}")

        return is_allowed, new_count, ttl
    
    async def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions (for maintenance)."""
        # This would typically be called by a background task
        # For now, Redis handles TTL automatically
        logger.info("Session cleanup completed (handled by Redis TTL)")
        return 0

# Global session service instance
session_service = SessionService()
