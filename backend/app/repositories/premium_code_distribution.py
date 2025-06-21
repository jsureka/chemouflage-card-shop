from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.product import PremiumCodeDistribution, PremiumCodeDistributionCreate


class PremiumCodeDistributionRepository:
    @staticmethod
    async def create(distribution: PremiumCodeDistributionCreate) -> str:
        """Create a new premium code distribution record"""
        db = await get_database()
        
        distribution_dict = distribution.model_dump()
        distribution_dict["sent_at"] = datetime.utcnow()
        distribution_dict["created_at"] = datetime.utcnow()
        
        result = await db.premium_code_distributions.insert_one(distribution_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_by_order_id(order_id: str) -> List[PremiumCodeDistribution]:
        """Get all premium code distributions for an order"""
        db = await get_database()
        cursor = db.premium_code_distributions.find({"order_id": order_id}).sort("sent_at", -1)
        
        distributions = []
        async for doc in cursor:
            distributions.append(PremiumCodeDistribution(
                **doc,
                id=str(doc["_id"])
            ))
        
        return distributions
    
    @staticmethod
    async def get_by_user_email(user_email: str) -> List[PremiumCodeDistribution]:
        """Get all premium code distributions for a user email"""
        db = await get_database()
        cursor = db.premium_code_distributions.find({"user_email": user_email}).sort("sent_at", -1)
        
        distributions = []
        async for doc in cursor:
            distributions.append(PremiumCodeDistribution(
                **doc,
                id=str(doc["_id"])
            ))
        
        return distributions
    
    @staticmethod
    async def get_by_premium_code_id(premium_code_id: str) -> List[PremiumCodeDistribution]:
        """Get all distributions for a specific premium code"""
        db = await get_database()
        cursor = db.premium_code_distributions.find({"premium_code_id": premium_code_id}).sort("sent_at", -1)
        
        distributions = []
        async for doc in cursor:
            distributions.append(PremiumCodeDistribution(
                **doc,
                id=str(doc["_id"])
            ))
        
        return distributions
    
    @staticmethod
    async def check_code_already_sent(order_id: str, premium_code_id: str) -> bool:
        """Check if a specific premium code was already sent for an order"""
        db = await get_database()
        result = await db.premium_code_distributions.find_one({
            "order_id": order_id,
            "premium_code_id": premium_code_id
        })
        return result is not None
