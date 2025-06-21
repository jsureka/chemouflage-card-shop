from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_admin, get_current_user
from app.models.quiz import QuizStatsResponse, TopicStatsResponse
from app.models.user import User
from app.repositories.quiz_stats import QuizStatsRepository

router = APIRouter()


@router.get("/", response_model=QuizStatsResponse)
async def get_quiz_stats(
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Get overall quiz statistics. Only for admins.
    """
    try:
        stats = await QuizStatsRepository.get_overall_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quiz statistics: {str(e)}"
        )


@router.get("/topics", response_model=List[TopicStatsResponse])
async def get_topics_stats(
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Get statistics for all topics. Only for admins.
    """
    try:
        stats = await QuizStatsRepository.get_all_topics_with_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch topics statistics: {str(e)}"
        )


@router.get("/topics/{topic_id}", response_model=TopicStatsResponse)
async def get_topic_stats(
    topic_id: str,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Get statistics for a specific topic. Only for admins.
    """
    try:
        stats = await QuizStatsRepository.get_topic_stats(topic_id)
        return stats
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch topic statistics: {str(e)}"
        )


@router.get("/summary", response_model=dict)
async def get_quiz_summary(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a summary of quiz data for regular users.
    """
    try:
        from app.repositories.quiz_question import QuestionRepository
        from app.repositories.quiz_topic import TopicRepository

        # Get basic counts for users
        active_topics = await TopicRepository.count(active_only=True)
        active_questions = await QuestionRepository.count(active_only=True)
        
        # Get topic list with question counts
        topics = await TopicRepository.get_all(active_only=True, limit=100)
        
        topic_summary = []
        for topic in topics:
            topic_summary.append({
                "id": topic.id,
                "name": topic.name,
                "description": topic.description,
                "question_count": topic.question_count
            })
        
        return {
            "total_active_topics": active_topics,
            "total_active_questions": active_questions,
            "topics": topic_summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quiz summary: {str(e)}"
        )
