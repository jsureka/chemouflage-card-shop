from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.quiz import Topic, TopicCreate, TopicInDB, TopicUpdate
from app.services.cache import (
    cache_invalidate,
    cache_invalidate_patterns,
    cache_service,
    cached,
)


class TopicRepository:
    
    @staticmethod
    @cache_invalidate_patterns("quiz_question:*", "quiz_topic:*", "quiz_stats:*")
    async def create(topic: TopicCreate) -> str:
        """Create a new topic"""
        db = await get_database()
        doc = topic.model_dump()
        doc["created_at"] = datetime.utcnow()
        result = await db.quiz_topics.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    @cached("quiz_topic:{topic_id}", ttl=300)  # Cache for 5 minutes
    async def get_by_id(topic_id: str) -> Optional[Topic]:
        # Get from database
        db = await get_database()
        topic = await db.quiz_topics.find_one({"_id": ObjectId(topic_id)})
        if topic:
            topic_obj = Topic(**topic, id=str(topic["_id"]))

            # Cache the topic
            await cache_service.set(topic_id, topic_obj.model_dump())

            return topic_obj
        return None

    @staticmethod
    @cached("quiz_topic:list:{skip}:{limit}:{active_only}:{search}", ttl=300)  # Cache for 5 minutes
    async def get_all(
        skip: int = 0, 
        limit: int = 100, 
        active_only: bool = False,
        search: Optional[str] = None
    ) -> List[Topic]:
        """Get all topics with pagination and optional filtering"""
        db = await get_database()
        
        # Build query filter
        query_filter = {}
        if active_only:
            query_filter["is_active"] = True
        if search:
            query_filter["name"] = {"$regex": search, "$options": "i"}
        
        # Get topics
        pipeline = [
            {"$match": query_filter},
            {"$lookup": {
                "from": "quiz_questions",
                "localField": "_id",
                "foreignField": "topic_id",
                "as": "questions"
            }},
            {"$addFields": {
                "question_count": {
                    "$size": {
                        "$filter": {
                            "input": "$questions",
                            "as": "question",
                            "cond": {"$eq": ["$$question.is_active", True]}
                        }
                    }
                }
            }},
            {"$sort": {"created_at": -1}},
            {"$skip": skip},
            {"$limit": limit}
        ]
        
        cursor = db.quiz_topics.aggregate(pipeline)
        topics = []
        
        async for doc in cursor:
            topic_data = {**doc, "id": str(doc["_id"])}
            topics.append(Topic(**topic_data))
        
        return topics

    @staticmethod
    @cached("quiz_topic:count:{active_only}:{search}", ttl=300)  # Cache for 5 minutes
    async def count(active_only: bool = False, search: Optional[str] = None) -> int:
        """Count total topics"""
        db = await get_database()
        
        query_filter = {}
        if active_only:
            query_filter["is_active"] = True
        if search:
            query_filter["name"] = {"$regex": search, "$options": "i"}
        
        return await db.quiz_topics.count_documents(query_filter)

    @staticmethod
    @cache_invalidate_patterns("quiz_question:*", "quiz_topic:*", "quiz_stats:*")
    async def update(topic_id: str, topic_update: TopicUpdate) -> Optional[Topic]:
        """Update topic"""
        db = await get_database()
        
        update_data = {k: v for k, v in topic_update.model_dump().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await db.quiz_topics.update_one(
                {"_id": ObjectId(topic_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await TopicRepository.get_by_id(topic_id)
        
        return None

    @staticmethod
    @cache_invalidate_patterns("quiz_question:*", "quiz_topic:*", "quiz_stats:*")
    async def delete(topic_id: str) -> bool:
        """Delete topic (soft delete by setting is_active=False)"""
        db = await get_database()
        
        # Check if topic has questions
        question_count = await db.quiz_questions.count_documents({
            "topic_id": topic_id,
            "is_active": True
        })
        
        if question_count > 0:
            # Soft delete if topic has questions
            result = await db.quiz_topics.update_one(
                {"_id": ObjectId(topic_id)},
                {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        else:
            # Hard delete if no questions
            result = await db.quiz_topics.delete_one({"_id": ObjectId(topic_id)})
            return result.deleted_count > 0

    @staticmethod
    async def get_by_name(name: str) -> Optional[Topic]:
        """Get topic by name (for duplicate checking)"""
        db = await get_database()
        doc = await db.quiz_topics.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
        if doc:
            question_count = await db.quiz_questions.count_documents({
                "topic_id": str(doc["_id"]),
                "is_active": True
            })
            
            topic_data = {**doc, "id": str(doc["_id"]), "question_count": question_count}
            return Topic(**topic_data)
        return None

    @staticmethod
    async def exists(topic_id: str) -> bool:
        """Check if topic exists"""
        db = await get_database()
        count = await db.quiz_topics.count_documents({"_id": ObjectId(topic_id)})
        return count > 0
