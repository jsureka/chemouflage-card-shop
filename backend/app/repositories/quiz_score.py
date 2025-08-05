from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.quiz_score import (
    DailyScore,
    DailyScoreCreate,
    DailyScoreInDB,
    DailyScoreUpdate,
    UserQuizScore,
    UserQuizScoreCreate,
    UserQuizScoreInDB,
    UserQuizScoreUpdate,
)
from app.services.cache import cache_invalidate_patterns, cached


class UserQuizScoreRepository:
    
    @staticmethod
    @cache_invalidate_patterns("user_quiz_score:*")
    async def create(score: UserQuizScoreCreate) -> str:
        """Create a new user quiz score"""
        db = await get_database()
        
        score_doc = score.model_dump()
        score_doc["created_at"] = datetime.utcnow()
        
        result = await db.user_quiz_scores.insert_one(score_doc)
        return str(result.inserted_id)
    
    @staticmethod
    @cached("user_quiz_score:user:{user_id}", ttl=300)
    async def get_by_user_id(user_id: str) -> Optional[UserQuizScore]:
        """Get user quiz score by user ID"""
        db = await get_database()
        
        doc = await db.user_quiz_scores.find_one({"user_id": user_id})
        if not doc:
            return None
        
        doc["id"] = str(doc["_id"])
        return UserQuizScore(**doc)
    
    @staticmethod
    @cache_invalidate_patterns("user_quiz_score:*")
    async def update(user_id: str, score_update: UserQuizScoreUpdate) -> Optional[UserQuizScore]:
        """Update user quiz score"""
        db = await get_database()
        
        update_data = {k: v for k, v in score_update.model_dump().items() if v is not None}
        if not update_data:
            return await UserQuizScoreRepository.get_by_user_id(user_id)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.user_quiz_scores.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await UserQuizScoreRepository.get_by_user_id(user_id)
    
    @staticmethod
    @cache_invalidate_patterns("user_quiz_score:*")
    async def upsert(user_id: str, score_update: UserQuizScoreUpdate) -> UserQuizScore:
        """Update or insert user quiz score"""
        db = await get_database()
        
        update_data = {k: v for k, v in score_update.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.user_quiz_scores.update_one(
            {"user_id": user_id},
            {"$set": update_data, "$setOnInsert": {"user_id": user_id, "created_at": datetime.utcnow()}},
            upsert=True
        )
        
        return await UserQuizScoreRepository.get_by_user_id(user_id)


class DailyScoreRepository:
    
    @staticmethod
    @cache_invalidate_patterns("daily_score:*")
    async def create(score: DailyScoreCreate) -> str:
        """Create a new daily score"""
        db = await get_database()
        
        score_doc = score.model_dump()
        score_doc["created_at"] = datetime.utcnow()
        
        result = await db.daily_scores.insert_one(score_doc)
        return str(result.inserted_id)
    
    @staticmethod
    @cached("daily_score:user:{user_id}:date:{date}", ttl=300)
    async def get_by_user_and_date(user_id: str, date: str) -> Optional[DailyScore]:
        """Get daily score by user ID and date"""
        db = await get_database()
        
        doc = await db.daily_scores.find_one({"user_id": user_id, "date": date})
        if not doc:
            return None
        
        doc["id"] = str(doc["_id"])
        return DailyScore(**doc)
    
    @staticmethod
    @cached("daily_score:leaderboard:date:{date}", ttl=300)
    async def get_daily_leaderboard(date: str, limit: int = 3) -> List[DailyScore]:
        """Get top users for a specific date"""
        db = await get_database()
        
        cursor = db.daily_scores.find({"date": date}).sort("daily_score", -1).limit(limit)
        scores = []
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            scores.append(DailyScore(**doc))
        
        return scores
    
    @staticmethod
    @cache_invalidate_patterns("daily_score:*")
    async def update(user_id: str, date: str, score_update: DailyScoreUpdate) -> Optional[DailyScore]:
        """Update daily score"""
        db = await get_database()
        
        update_data = {k: v for k, v in score_update.model_dump().items() if v is not None}
        if not update_data:
            return await DailyScoreRepository.get_by_user_and_date(user_id, date)
        
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.daily_scores.update_one(
            {"user_id": user_id, "date": date},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            return None
        
        return await DailyScoreRepository.get_by_user_and_date(user_id, date)
    
    @staticmethod
    @cache_invalidate_patterns("daily_score:*")
    async def upsert(user_id: str, user_email: str, user_name: str, date: str, score_update: DailyScoreUpdate) -> DailyScore:
        """Update or insert daily score"""
        db = await get_database()
        
        update_data = {k: v for k, v in score_update.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.daily_scores.update_one(
            {"user_id": user_id, "date": date},
            {
                "$set": update_data,
                "$setOnInsert": {
                    "user_id": user_id,
                    "user_email": user_email,
                    "user_name": user_name,
                    "date": date,
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )
        
        return await DailyScoreRepository.get_by_user_and_date(user_id, date)