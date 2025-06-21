from typing import Dict, List

from app.db.mongodb import get_database
from app.models.quiz import (
    DifficultyLevel,
    QuestionType,
    QuizStatsResponse,
    Topic,
    TopicStatsResponse,
)
from app.repositories.quiz_topic import TopicRepository
from app.services.cache import cached


class QuizStatsRepository:
    
    @staticmethod
    @cached("quiz_stats:overall", ttl=600)  # Cache for 10 minutes
    async def get_overall_stats() -> QuizStatsResponse:
        """Get overall quiz statistics"""
        db = await get_database()
        
        # Count totals
        total_topics = await db.quiz_topics.count_documents({})
        active_topics = await db.quiz_topics.count_documents({"is_active": True})
        total_questions = await db.quiz_questions.count_documents({})
        active_questions = await db.quiz_questions.count_documents({"is_active": True})
        
        # Questions by difficulty
        difficulty_pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}}
        ]
        difficulty_cursor = db.quiz_questions.aggregate(difficulty_pipeline)
        questions_by_difficulty = {diff.value: 0 for diff in DifficultyLevel}
        async for result in difficulty_cursor:
            questions_by_difficulty[result["_id"]] = result["count"]
        
        # Questions by type
        type_pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {"_id": "$question_type", "count": {"$sum": 1}}}
        ]
        type_cursor = db.quiz_questions.aggregate(type_pipeline)
        questions_by_type = {qtype.value: 0 for qtype in QuestionType}
        async for result in type_cursor:
            questions_by_type[result["_id"]] = result["count"]
        
        # Get topics with stats
        topics_with_stats = await QuizStatsRepository.get_all_topics_with_stats()
        
        return QuizStatsResponse(
            total_topics=total_topics,
            total_questions=total_questions,
            active_topics=active_topics,
            active_questions=active_questions,
            questions_by_difficulty=questions_by_difficulty,
            questions_by_type=questions_by_type,
            topics_with_stats=topics_with_stats
        )
    
    @staticmethod
    async def get_all_topics_with_stats() -> List[TopicStatsResponse]:
        """Get all topics with their question statistics"""
        db = await get_database()
        topics = await TopicRepository.get_all(active_only=True)
        
        topics_with_stats = []
        for topic in topics:
            topic_stats = await QuizStatsRepository.get_topic_stats(topic.id)
            topics_with_stats.append(topic_stats)
        
        return topics_with_stats
    
    @staticmethod
    @cached("quiz_stats:topic:{topic_id}", ttl=300)
    async def get_topic_stats(topic_id: str) -> TopicStatsResponse:
        """Get statistics for a specific topic"""
        db = await get_database()
        
        # Get topic
        topic = await TopicRepository.get_by_id(topic_id)
        if not topic:
            raise ValueError(f"Topic with id {topic_id} not found")
        
        # Total questions in topic
        total_questions = await db.quiz_questions.count_documents({
            "topic_id": topic_id,
            "is_active": True
        })
        
        # Questions by difficulty
        difficulty_pipeline = [
            {"$match": {"topic_id": topic_id, "is_active": True}},
            {"$group": {"_id": "$difficulty", "count": {"$sum": 1}}}
        ]
        difficulty_cursor = db.quiz_questions.aggregate(difficulty_pipeline)
        questions_by_difficulty = {diff.value: 0 for diff in DifficultyLevel}
        async for result in difficulty_cursor:
            questions_by_difficulty[result["_id"]] = result["count"]
        
        # Questions by type
        type_pipeline = [
            {"$match": {"topic_id": topic_id, "is_active": True}},
            {"$group": {"_id": "$question_type", "count": {"$sum": 1}}}
        ]
        type_cursor = db.quiz_questions.aggregate(type_pipeline)
        questions_by_type = {qtype.value: 0 for qtype in QuestionType}
        async for result in type_cursor:
            questions_by_type[result["_id"]] = result["count"]
        
        return TopicStatsResponse(
            topic=topic,
            total_questions=total_questions,
            questions_by_difficulty=questions_by_difficulty,
            questions_by_type=questions_by_type
        )
