import logging
import sys
from typing import List

import uvicorn
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo
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

@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up Chemouflage API...")
    await connect_to_mongo()
    logger.info("Database connected successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down Chemouflage API...")
    await close_mongo_connection()
    logger.info("Database connection closed")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Chemouflage API"}

@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and load balancers"""
    return {"status": "healthy", "service": "chemouflage-api"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
