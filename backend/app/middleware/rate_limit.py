"""
Rate limiting middleware using Redis for API protection and abuse prevention.
"""
import logging
from typing import Callable

from app.services.session import session_service
from fastapi import HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent API abuse."""
    
    def __init__(
        self,
        app,
        default_requests_per_minute: int = 60,
        default_requests_per_hour: int = 1000,
        enable_rate_limiting: bool = True
    ):
        super().__init__(app)
        self.default_requests_per_minute = default_requests_per_minute
        self.default_requests_per_hour = default_requests_per_hour
        self.enable_rate_limiting = enable_rate_limiting
        
        # Define different rate limits for different endpoints
        self.endpoint_limits = {
            "/api/v1/auth/login": {"requests": 5, "window": 300},  # 5 requests per 5 minutes
            "/api/v1/auth/register": {"requests": 3, "window": 300},  # 3 requests per 5 minutes
            "/api/v1/auth/reset-password": {"requests": 3, "window": 600},  # 3 requests per 10 minutes
            "/api/v1/products": {"requests": 100, "window": 60},  # 100 requests per minute
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enable_rate_limiting:
            return await call_next(request)
        
        # Get client identifier
        client_ip = self.get_client_ip(request)
        user_id = self.get_user_id(request)
        identifier = user_id if user_id else client_ip
        
        # Check rate limits
        path = request.url.path
        method = request.method
        
        # Skip rate limiting for health checks and static files
        if path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        try:
            # Apply rate limiting
            await self._apply_rate_limits(identifier, path, method)
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            self._add_rate_limit_headers(response, identifier, path)
            
            return response
            
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail, "type": "rate_limit_exceeded"}
            )
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Continue without rate limiting if Redis is down
            return await call_next(request)
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address."""
        # Check for forwarded headers (from reverse proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def get_user_id(self, request: Request) -> str:
        """Extract user ID from request if authenticated."""
        # This would typically extract from JWT token
        # For now, we'll use a simple approach
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            # In a real implementation, you'd decode the JWT token here
            # For now, we'll return None to use IP-based rate limiting
            pass
        return None
    
    async def _apply_rate_limits(self, identifier: str, path: str, method: str):
        """Apply rate limiting rules."""
        # Check endpoint-specific limits
        if path in self.endpoint_limits:
            limit_config = self.endpoint_limits[path]
            allowed, count, ttl = await session_service.check_rate_limit(
                f"{identifier}:{path}",
                limit_config["requests"],
                limit_config["window"],
                f"{method}:{path}"
            )
            
            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: {count}/{limit_config['requests']} requests. "
                           f"Try again in {ttl} seconds.",
                    headers={
                        "Retry-After": str(ttl),
                        "X-RateLimit-Limit": str(limit_config["requests"]),
                        "X-RateLimit-Remaining": str(max(0, limit_config["requests"] - count)),
                        "X-RateLimit-Reset": str(ttl)
                    }
                )
        
        # Apply default per-minute limit
        allowed, count, ttl = await session_service.check_rate_limit(
            f"{identifier}:minute",
            self.default_requests_per_minute,
            60,
            "default_minute"
        )
        
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {count}/{self.default_requests_per_minute} "
                       f"requests per minute. Try again in {ttl} seconds.",
                headers={
                    "Retry-After": str(ttl),
                    "X-RateLimit-Limit": str(self.default_requests_per_minute),
                    "X-RateLimit-Remaining": str(max(0, self.default_requests_per_minute - count)),
                    "X-RateLimit-Reset": str(ttl)
                }
            )
        
        # Apply default per-hour limit
        allowed, count, ttl = await session_service.check_rate_limit(
            f"{identifier}:hour",
            self.default_requests_per_hour,
            3600,
            "default_hour"
        )
        
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {count}/{self.default_requests_per_hour} "
                       f"requests per hour. Try again in {ttl} seconds.",
                headers={
                    "Retry-After": str(ttl),
                    "X-RateLimit-Limit": str(self.default_requests_per_hour),
                    "X-RateLimit-Remaining": str(max(0, self.default_requests_per_hour - count)),
                    "X-RateLimit-Reset": str(ttl)
                }
            )
    
    def _add_rate_limit_headers(self, response: Response, identifier: str, path: str):
        """Add rate limit information to response headers."""
        # This is optional and could be implemented to show current rate limit status
        pass

def create_rate_limit_middleware(
    default_requests_per_minute: int = 60,
    default_requests_per_hour: int = 1000,
    enable_rate_limiting: bool = True
) -> RateLimitMiddleware:
    """Factory function to create rate limit middleware."""
    return RateLimitMiddleware(
        app=None,  # Will be set by FastAPI
        default_requests_per_minute=default_requests_per_minute,
        default_requests_per_hour=default_requests_per_hour,
        enable_rate_limiting=enable_rate_limiting
    )
