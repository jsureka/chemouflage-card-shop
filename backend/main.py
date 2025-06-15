import logging
import sys
from datetime import datetime
from typing import List

import uvicorn
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.db.redis import close_redis_connection, connect_to_redis
from app.middleware.rate_limit import RateLimitMiddleware
from app.services.firebase_auth import firebase_auth_service
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)

# Set specific loggers
logging.getLogger("app.services.aamarpay").setLevel(logging.DEBUG)
logging.getLogger("app.api.v1.endpoints.orders").setLevel(logging.DEBUG)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    default_requests_per_minute=60,
    default_requests_per_hour=1000,
    enable_rate_limiting=True
)

@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up Chemouflage API...")
    await connect_to_mongo()
    logger.info("Database connected successfully")
    
    # Initialize Redis
    await connect_to_redis() 
    logger.info("Redis connection initialized")
    
    # Initialize Firebase (this happens automatically when imported)
    if firebase_auth_service._app:
        logger.info("Firebase authentication initialized successfully")
    else:
        logger.warning("Firebase authentication not initialized - check configuration")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Chemouflage API...")
    await close_mongo_connection()
    logger.info("Database connection closed")
    
    await close_redis_connection()
    logger.info("Redis connection closed")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Chemouflage API"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and load balancers"""
    from app.db.redis import redis_manager
    
    health_status = {
        "status": "healthy", 
        "service": "chemouflage-api",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "healthy",
            "mongodb": "healthy",  # Assume healthy if we can respond  
            "redis": "healthy" if await redis_manager.is_connected() else "degraded"
        }
    }
    
    return health_status

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
