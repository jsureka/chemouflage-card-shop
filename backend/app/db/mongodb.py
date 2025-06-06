from app.core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient


class Database:
    client: AsyncIOMotorClient = None
    
db = Database()

async def get_database() -> AsyncIOMotorClient:
    return db.client[settings.DATABASE_NAME]

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.MONGODB_URI)
    print("Connected to MongoDB")
    
async def close_mongo_connection():
    db.client.close()
    print("Closed MongoDB connection")
