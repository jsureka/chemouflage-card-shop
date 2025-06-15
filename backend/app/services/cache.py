"""
Cache service for managing application-level caching with Redis.
Provides decorators and utility functions for common caching patterns.
"""
import json
import logging
from functools import wraps
from typing import Any, Callable, Optional, Union

from app.core.config import settings
from app.db.redis import get_redis

logger = logging.getLogger(__name__)

class CacheService:
    """High-level cache service with application-specific functionality."""
    
    def __init__(self):
        self.redis_manager = None
    
    async def _get_redis(self):
        """Get Redis manager instance."""
        if not self.redis_manager:
            self.redis_manager = await get_redis()
        return self.redis_manager
    
    # Product caching methods
    async def get_product(self, product_id: str) -> Optional[dict]:
        """Get cached product by ID."""
        redis = await self._get_redis()
        return await redis.get_json(f"product:{product_id}")
    
    async def set_product(self, product_id: str, product_data: dict) -> bool:
        """Cache product data."""
        redis = await self._get_redis()
        return await redis.set(
            f"product:{product_id}", 
            product_data, 
            ttl=settings.CACHE_TTL_PRODUCTS
        )
    
    async def invalidate_product(self, product_id: str) -> bool:
        """Remove product from cache."""
        redis = await self._get_redis()
        return await redis.delete(f"product:{product_id}")
    
    async def get_products_list(self, cache_key: str) -> Optional[list]:
        """Get cached products list (for pagination, filtering, etc.)."""
        redis = await self._get_redis()
        return await redis.get_json(f"products:{cache_key}")
    
    async def set_products_list(self, cache_key: str, products_data: list) -> bool:
        """Cache products list."""
        redis = await self._get_redis()
        return await redis.set(
            f"products:{cache_key}", 
            products_data, 
            ttl=settings.CACHE_TTL_PRODUCTS
        )
    
    async def invalidate_all_products(self) -> int:
        """Invalidate all product-related cache entries."""
        redis = await self._get_redis()
        count = await redis.delete_pattern("product:*")
        count += await redis.delete_pattern("products:*")
        return count
    
    # User session caching
    async def get_user_session(self, user_id: str) -> Optional[dict]:
        """Get cached user session data."""
        redis = await self._get_redis()
        return await redis.get_json(f"user_session:{user_id}")
    
    async def set_user_session(self, user_id: str, session_data: dict) -> bool:
        """Cache user session data."""
        redis = await self._get_redis()
        return await redis.set(
            f"user_session:{user_id}", 
            session_data, 
            ttl=settings.CACHE_TTL_USER_SESSIONS
        )
    
    async def invalidate_user_session(self, user_id: str) -> bool:
        """Remove user session from cache."""
        redis = await self._get_redis()
        return await redis.delete(f"user_session:{user_id}")
    
    # User profile caching
    async def get_user_profile(self, user_id: str) -> Optional[dict]:
        """Get cached user profile."""
        redis = await self._get_redis()
        return await redis.get_json(f"user_profile:{user_id}")
    
    async def set_user_profile(self, user_id: str, profile_data: dict) -> bool:
        """Cache user profile data."""
        redis = await self._get_redis()
        return await redis.set(
            f"user_profile:{user_id}", 
            profile_data, 
            ttl=settings.CACHE_TTL_SECONDS
        )
    
    async def invalidate_user_profile(self, user_id: str) -> bool:
        """Remove user profile from cache."""
        redis = await self._get_redis()
        return await redis.delete(f"user_profile:{user_id}")
    
    # Rate limiting
    async def check_rate_limit(
        self, 
        key: str, 
        limit: int, 
        window_seconds: int
    ) -> tuple[bool, int]:
        """
        Check rate limit for a given key.
        Returns (is_allowed, current_count).
        """
        redis = await self._get_redis()
        current = await redis.increment(f"rate_limit:{key}", 1, window_seconds)
        
        if current is None:
            # Redis unavailable, allow request
            return True, 0
        
        return current <= limit, current
    
    # General caching with TTL
    async def get(self, key: str) -> Optional[Union[str, dict, list]]:
        """Get value from cache."""
        redis = await self._get_redis()
        # Try to get as JSON first, then as string
        result = await redis.get_json(key)
        if result is None:
            result = await redis.get(key)
        return result
    
    async def set(
        self, 
        key: str, 
        value: Union[str, dict, list], 
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache."""
        redis = await self._get_redis()
        return await redis.set(key, value, ttl or settings.CACHE_TTL_SECONDS)
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        redis = await self._get_redis()
        return await redis.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        redis = await self._get_redis()
        return await redis.exists(key)

# Global cache service instance
cache_service = CacheService()

def cached(key_pattern: str, ttl: Optional[int] = None):
    """
    Decorator for caching function results.
    
    Args:
        key_pattern: Cache key pattern (can include {args} placeholders)
        ttl: Time to live in seconds
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Generate cache key
            cache_key = key_pattern.format(
                args='_'.join(str(arg) for arg in args),
                **kwargs
            )
            
            # Try to get from cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_result
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            if result is not None:
                await cache_service.set(cache_key, result, ttl)
                logger.debug(f"Cached result for key: {cache_key}")
            
            return result
        
        return wrapper
    return decorator

def cache_invalidate(key_pattern: str):
    """
    Decorator for invalidating cache entries after function execution.
    
    Args:
        key_pattern: Cache key pattern to invalidate
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            result = await func(*args, **kwargs)
            
            # Invalidate cache
            cache_key = key_pattern.format(
                args='_'.join(str(arg) for arg in args),
                **kwargs
            )
            await cache_service.delete(cache_key)
            logger.debug(f"Invalidated cache for key: {cache_key}")
            
            return result
        
        return wrapper
    return decorator
