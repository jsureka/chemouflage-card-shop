from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.quiz_session import (
    QuizSession,
    QuizSessionCreate,
    QuizSessionInDB,
    QuizSessionStatus,
    QuizSessionUpdate,
)
from app.services.cache import cache_invalidate_patterns, cached


class QuizSessionRepository:
    
    @staticmethod
    @cache_invalidate_patterns("quiz_session:*")
    async def create(session: QuizSessionCreate) -> str:
        """Create a new quiz session"""
        db = await get_database()
        
        session_doc = session.model_dump()
        session_doc["created_at"] = datetime.utcnow()
        session_doc["current_question_index"] = 0
        session_doc["answers"] = []
        session_doc["status"] = QuizSessionStatus.ACTIVE
        
        result = await db.quiz_sessions.insert_one(session_doc)
        return str(result.inserted_id)
    
    @staticmethod
    @cached("quiz_session:{session_id}", ttl=300)
    async def get_by_id(session_id: str) -> Optional[QuizSession]:
        """Get quiz session by ID"""
        db = await get_database()
        
        session_doc = await db.quiz_sessions.find_one({"_id": ObjectId(session_id)})
        if not session_doc:
            return None
        
        session_data = {**session_doc, "id": str(session_doc["_id"])}
        return QuizSession(**session_data)
    
    @staticmethod
    @cache_invalidate_patterns("quiz_session:*")
    async def update(session_id: str, session_update: QuizSessionUpdate) -> Optional[QuizSession]:
        """Update quiz session"""
        db = await get_database()
        
        update_data = {k: v for k, v in session_update.model_dump().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            await db.quiz_sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": update_data}
            )
        
        return await QuizSessionRepository.get_by_id(session_id)
    
    @staticmethod
    async def get_active_session_for_user(user_id: str, date: Optional[datetime] = None) -> Optional[QuizSession]:
        """Get active quiz session for user on a specific date"""
        db = await get_database()
        
        if date is None:
            date = datetime.utcnow()
        
        # Get start and end of the day
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        session_doc = await db.quiz_sessions.find_one({
            "user_id": user_id,
            "status": QuizSessionStatus.ACTIVE,
            "started_at": {
                "$gte": start_of_day,
                "$lte": end_of_day
            }
        })
        
        if not session_doc:
            return None
        
        session_data = {**session_doc, "id": str(session_doc["_id"])}
        return QuizSession(**session_data)
    
    @staticmethod
    async def has_completed_quiz_today(user_id: str, date: Optional[datetime] = None) -> bool:
        """Check if user has completed a quiz today"""
        db = await get_database()
        
        if date is None:
            date = datetime.utcnow()
        
        # Get start and end of the day
        start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        completed_session = await db.quiz_sessions.find_one({
            "user_id": user_id,
            "status": QuizSessionStatus.COMPLETED,
            "completed_at": {
                "$gte": start_of_day,
                "$lte": end_of_day
            }
        })
        
        return completed_session is not None
    
    @staticmethod
    async def get_user_sessions(
        user_id: str,
        skip: int = 0,
        limit: int = 10,
        status: Optional[QuizSessionStatus] = None
    ) -> List[QuizSession]:
        """Get user's quiz sessions with pagination"""
        db = await get_database()
        
        query_filter = {"user_id": user_id}
        if status:
            query_filter["status"] = status
        
        cursor = db.quiz_sessions.find(query_filter).skip(skip).limit(limit).sort("started_at", -1)
        sessions = []
        
        async for session_doc in cursor:
            session_data = {**session_doc, "id": str(session_doc["_id"])}
            sessions.append(QuizSession(**session_data))
        
        return sessions
