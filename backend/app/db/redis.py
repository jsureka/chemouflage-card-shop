"""
Redis connection and management module.
Provides connection pooling, error handling, and utility functions for Redis operations.
"""
import json
import logging
from typing import Any, Optional, Union

import aioredis
from aioredis import Redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisManager:
    """Redis connection manager with connection pooling and error handling."""
    
    def __init__(self):
        self.redis: Optional[Redis] = None
        self._pool = None
    
    async def connect(self) -> None:
        """Establish connection to Redis with connection pooling."""
        try:
            connection_params = {
                'max_connections': settings.REDIS_POOL_MAX_CONNECTIONS,
                'retry_on_timeout': True,
                'health_check_interval': 30,
                'decode_responses': True
            }
            
            # Add password if provided
            if settings.REDIS_PASSWORD:
                connection_params['password'] = settings.REDIS_PASSWORD
            
            # Create connection pool
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                db=settings.REDIS_DB,
                **connection_params
            )
            
            # Test connection
            await self.redis.ping()
            logger.info("Successfully connected to Redis")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            # Don't raise exception to allow app to start without Redis
            # Redis operations will gracefully degrade
            self.redis = None
    
    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self.redis:
            try:
                await self.redis.close()
                logger.info("Redis connection closed")
            except Exception as e:
                logger.error(f"Error closing Redis connection: {e}")
    
    async def is_connected(self) -> bool:
        """Check if Redis is connected and available."""
        if not self.redis:
            return False
        try:
            await self.redis.ping()
            return True
        except Exception:
            return False
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from Redis with error handling."""
        if not await self.is_connected():
            return None
        
        try:
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"Redis GET error for key {key}: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Union[str, dict, list], 
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in Redis with optional TTL and error handling."""
        if not await self.is_connected():
            return False
        
        try:
            # Serialize complex types
            if isinstance(value, (dict, list)):
                value = json.dumps(value, default=str)
            
            if ttl:
                await self.redis.setex(key, ttl, value)
            else:
                await self.redis.set(key, value)
            return True
        except Exception as e:
            logger.error(f"Redis SET error for key {key}: {e}")
            return False
    
    async def get_json(self, key: str) -> Optional[Union[dict, list]]:
        """Get and deserialize JSON value from Redis."""
        value = await self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error for key {key}: {e}")
        return None
    
    async def delete(self, key: str) -> bool:
        """Delete key from Redis."""
        if not await self.is_connected():
            return False
        
        try:
            result = await self.redis.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Redis DELETE error for key {key}: {e}")
            return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern."""
        if not await self.is_connected():
            return 0
        
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Redis DELETE pattern error for pattern {pattern}: {e}")
            return 0
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis."""
        if not await self.is_connected():
            return False
        
        try:
            return await self.redis.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis EXISTS error for key {key}: {e}")
            return False
    
    async def increment(self, key: str, amount: int = 1, ttl: Optional[int] = None) -> Optional[int]:
        """Increment counter in Redis."""
        if not await self.is_connected():
            return None
        
        try:
            pipeline = self.redis.pipeline()
            pipeline.incrby(key, amount)
            if ttl:
                pipeline.expire(key, ttl)
            results = await pipeline.execute()
            return results[0]
        except Exception as e:
            logger.error(f"Redis INCREMENT error for key {key}: {e}")
            return None
    
    async def get_ttl(self, key: str) -> Optional[int]:
        """Get TTL for a key."""
        if not await self.is_connected():
            return None
        
        try:
            return await self.redis.ttl(key)
        except Exception as e:
            logger.error(f"Redis TTL error for key {key}: {e}")
            return None

# Global Redis manager instance
redis_manager = RedisManager()

async def get_redis() -> RedisManager:
    """Dependency to get Redis manager."""
    return redis_manager

async def connect_to_redis():
    """Connect to Redis on startup."""
    await redis_manager.connect()

async def close_redis_connection():
    """Close Redis connection on shutdown."""
    await redis_manager.disconnect()
