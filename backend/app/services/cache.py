"""
Cache service for managing application-level caching with Redis.
Provides decorators and utility functions for common caching patterns.
"""
import inspect
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
    
    async def delete_patterns(self, *patterns: str) -> int:
        """Delete all keys matching the given patterns."""
        redis = await self._get_redis()
        total_deleted = 0
        for pattern in patterns:
            keys = [key async for key in redis.scan_iter(pattern)]
            if keys:
                deleted = await redis.delete_many(keys)
                total_deleted += deleted
        return total_deleted
    
    async def invalidate_patterns(self, *patterns: str) -> int:
        """Alias for delete_patterns for consistency with decorators."""
        return await self.delete_patterns(*patterns)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        redis = await self._get_redis()
        return await redis.exists(key)

# Global cache service instance
cache_service = CacheService()

def cached(key_pattern: str, ttl: Optional[int] = None):
    """
    Decorator for caching function results.
    Converts Pydantic model(s) to dict(s) before caching, and restores them after retrieval.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            import inspect

            from pydantic import BaseModel

            # Generate cache key
            sig = inspect.signature(func)
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()
            format_dict = {
                'args': '_'.join(str(arg) for arg in args),
                **bound_args.arguments
            }
            cache_key = key_pattern.format(**format_dict)
            # Try to get from cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                # If the function returns a list of models, reconstruct them
                if hasattr(func, '__annotations__') and 'return' in func.__annotations__:
                    return_type = func.__annotations__['return']
                    # Handle List[Model] return type
                    if (getattr(return_type, '__origin__', None) is list and
                        hasattr(return_type, '__args__') and
                        hasattr(return_type.__args__[0], 'parse_obj')):
                        model_cls = return_type.__args__[0]
                        return [model_cls.parse_obj(item) for item in cached_result]
                return cached_result
            # Execute function
            result = await func(*args, **kwargs)
            # Convert Pydantic models to dicts before caching
            to_cache = result
            if isinstance(result, BaseModel):
                to_cache = result.model_dump()
            elif isinstance(result, list) and result and isinstance(result[0], BaseModel):
                to_cache = [item.model_dump() for item in result]
            if to_cache is not None:
                await cache_service.set(cache_key, to_cache, ttl)
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
            # Get function signature to map positional args to parameter names
            sig = inspect.signature(func)
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()
            
            # Create a format dict with both positional args and kwargs
            format_dict = {
                'args': '_'.join(str(arg) for arg in args),
                **bound_args.arguments
            }
            
            cache_key = key_pattern.format(**format_dict)
            await cache_service.delete(cache_key)
            logger.debug(f"Invalidated cache for key: {cache_key}")
            
            return result
        
        return wrapper
    return decorator

def cache_invalidate_patterns(*key_patterns: str):
    """
    Decorator for invalidating multiple cache patterns after function execution.
    Args:
        *key_patterns: Multiple cache key patterns to invalidate
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            result = await func(*args, **kwargs)
            await cache_service.invalidate_patterns(*key_patterns)
            logger.debug(f"Invalidated cache patterns: {key_patterns}")
            return result
        return wrapper
    return decorator