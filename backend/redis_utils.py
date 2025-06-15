"""
Redis management utility script for cache operations and maintenance.
"""
import asyncio
import logging
from typing import Any, Dict, List

from app.db.redis import redis_manager
from app.services.cache import cache_service
from app.services.session import session_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheManager:
    """Utility class for cache management operations."""
    
    def __init__(self):
        self.redis = None
    
    async def initialize(self):
        """Initialize Redis connection."""
        await redis_manager.connect()
        self.redis = redis_manager
        
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get Redis cache statistics."""
        if not await self.redis.is_connected():
            return {"error": "Redis not connected"}
        
        try:
            info = await self.redis.redis.info()
            keys_count = await self.redis.redis.dbsize()
            
            return {
                "connected": True,
                "total_keys": keys_count,
                "memory_used": info.get("used_memory_human", "Unknown"),
                "memory_peak": info.get("used_memory_peak_human", "Unknown"),
                "connections": info.get("connected_clients", 0),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0),
                "hit_rate": self._calculate_hit_rate(
                    info.get("keyspace_hits", 0), 
                    info.get("keyspace_misses", 0)
                )
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"error": str(e)}
    
    def _calculate_hit_rate(self, hits: int, misses: int) -> float:
        """Calculate cache hit rate percentage."""
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0
    
    async def get_keys_by_pattern(self, pattern: str) -> List[str]:
        """Get all keys matching a pattern."""
        if not await self.redis.is_connected():
            return []
        
        try:
            return await self.redis.redis.keys(pattern)
        except Exception as e:
            logger.error(f"Error getting keys by pattern {pattern}: {e}")
            return []
    
    async def clear_cache_by_pattern(self, pattern: str) -> int:
        """Clear cache entries matching a pattern."""
        if not await self.redis.is_connected():
            return 0
        
        try:
            return await self.redis.delete_pattern(pattern)
        except Exception as e:
            logger.error(f"Error clearing cache pattern {pattern}: {e}")
            return 0
    
    async def clear_all_cache(self) -> bool:
        """Clear all cache entries (use with caution)."""
        if not await self.redis.is_connected():
            return False
        
        try:
            await self.redis.redis.flushdb()
            logger.info("All cache entries cleared")
            return True
        except Exception as e:
            logger.error(f"Error clearing all cache: {e}")
            return False
    
    async def clear_product_cache(self) -> int:
        """Clear all product-related cache entries."""
        count = await cache_service.invalidate_all_products()
        logger.info(f"Cleared {count} product cache entries")
        return count
    
    async def clear_user_sessions(self) -> int:
        """Clear all user session cache entries."""
        count = await self.clear_cache_by_pattern("user_session:*")
        count += await self.clear_cache_by_pattern("session:*")
        logger.info(f"Cleared {count} user session entries")
        return count
    
    async def clear_rate_limits(self) -> int:
        """Clear all rate limiting entries."""
        count = await self.clear_cache_by_pattern("rate_limit:*")
        logger.info(f"Cleared {count} rate limit entries")
        return count
    
    async def get_cache_size_by_type(self) -> Dict[str, int]:
        """Get cache entry counts by type."""
        patterns = {
            "products": "product*",
            "users": "user*", 
            "sessions": "session:*",
            "rate_limits": "rate_limit:*",
            "orders": "order*"
        }
        
        results = {}
        for cache_type, pattern in patterns.items():
            keys = await self.get_keys_by_pattern(pattern)
            results[cache_type] = len(keys)
        
        return results
    
    async def monitor_cache_performance(self, duration_seconds: int = 60):
        """Monitor cache performance for a specified duration."""
        logger.info(f"Monitoring cache performance for {duration_seconds} seconds...")
        
        initial_stats = await self.get_cache_stats()
        await asyncio.sleep(duration_seconds)
        final_stats = await self.get_cache_stats()
        
        if "error" in initial_stats or "error" in final_stats:
            logger.error("Unable to monitor cache performance due to connection issues")
            return
        
        hits_diff = final_stats["keyspace_hits"] - initial_stats["keyspace_hits"]
        misses_diff = final_stats["keyspace_misses"] - initial_stats["keyspace_misses"]
        
        logger.info(f"Cache Performance Report ({duration_seconds}s):")
        logger.info(f"  Hits: {hits_diff}")
        logger.info(f"  Misses: {misses_diff}")
        logger.info(f"  Hit Rate: {self._calculate_hit_rate(hits_diff, misses_diff):.2f}%")
        logger.info(f"  Keys Added/Removed: {final_stats['total_keys'] - initial_stats['total_keys']}")

# CLI Commands
async def main():
    """Main CLI interface for cache management."""
    import sys
    
    cache_manager = CacheManager()
    await cache_manager.initialize()
    
    if len(sys.argv) < 2:
        print("Usage: python redis_utils.py <command>")
        print("Commands:")
        print("  stats - Show cache statistics")
        print("  clear-products - Clear product cache")
        print("  clear-sessions - Clear user sessions")
        print("  clear-rate-limits - Clear rate limits")
        print("  clear-all - Clear all cache (DANGER!)")
        print("  monitor [seconds] - Monitor performance")
        print("  size-by-type - Show cache size by type")
        return
    
    command = sys.argv[1].lower()
    
    if command == "stats":
        stats = await cache_manager.get_cache_stats()
        print("Redis Cache Stats:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
    
    elif command == "clear-products":
        count = await cache_manager.clear_product_cache()
        print(f"Cleared {count} product cache entries")
    
    elif command == "clear-sessions":
        count = await cache_manager.clear_user_sessions()
        print(f"Cleared {count} session entries")
    
    elif command == "clear-rate-limits":
        count = await cache_manager.clear_rate_limits()
        print(f"Cleared {count} rate limit entries")
    
    elif command == "clear-all":
        confirm = input("This will clear ALL cache entries. Are you sure? (yes/no): ")
        if confirm.lower() == "yes":
            success = await cache_manager.clear_all_cache()
            print("All cache cleared" if success else "Failed to clear cache")
        else:
            print("Operation cancelled")
    
    elif command == "monitor":
        duration = int(sys.argv[2]) if len(sys.argv) > 2 else 60
        await cache_manager.monitor_cache_performance(duration)
    
    elif command == "size-by-type":
        sizes = await cache_manager.get_cache_size_by_type()
        print("Cache entries by type:")
        for cache_type, count in sizes.items():
            print(f"  {cache_type}: {count}")
    
    else:
        print(f"Unknown command: {command}")
    
    await redis_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
