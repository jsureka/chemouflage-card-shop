from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_admin, get_current_user
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.quiz import Topic, TopicCreate, TopicUpdate
from app.models.user import User
from app.repositories.quiz_topic import TopicRepository
from app.utils.pagination import create_paginated_response

router = APIRouter()


@router.post("/", response_model=Topic, status_code=status.HTTP_201_CREATED)
async def create_topic(
    topic_in: TopicCreate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Create a new quiz topic. Only for admins.
    """
    # Check if topic with same name already exists
    existing_topic = await TopicRepository.get_by_name(topic_in.name)
    if existing_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this name already exists"
        )
    
    topic_id = await TopicRepository.create(topic_in)
    return await TopicRepository.get_by_id(topic_id)


@router.get("/", response_model=PaginatedResponse[Topic])
async def get_topics(
    pagination: PaginationParams = Depends(),
    active_only: bool = Query(True, description="Filter only active topics"),
    search: Optional[str] = Query(None, description="Search topics by name"),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all quiz topics with pagination and optional filtering.
    """
    topics = await TopicRepository.get_all(
        skip=pagination.skip,
        limit=pagination.limit,
        active_only=active_only,
        search=search
    )
    
    total_count = await TopicRepository.count(
        active_only=active_only,
        search=search
    )
    
    return await create_paginated_response(
        data=topics,
        page=pagination.page,
        limit=pagination.limit,
        total_count=total_count
    )


@router.get("/{topic_id}", response_model=Topic)
async def get_topic(
    topic_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific quiz topic by ID.
    """
    topic = await TopicRepository.get_by_id(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic


@router.put("/{topic_id}", response_model=Topic)
async def update_topic(
    topic_id: str,
    topic_update: TopicUpdate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Update a quiz topic. Only for admins.
    """
    # Check if topic exists
    existing_topic = await TopicRepository.get_by_id(topic_id)
    if not existing_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    # Check for name conflicts if name is being updated
    if topic_update.name and topic_update.name != existing_topic.name:
        name_conflict = await TopicRepository.get_by_name(topic_update.name)
        if name_conflict and name_conflict.id != topic_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Topic with this name already exists"
            )
    
    updated_topic = await TopicRepository.update(topic_id, topic_update)
    if not updated_topic:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update topic"
        )
    
    return updated_topic


@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: str,
    current_user: User = Depends(get_current_admin)
) -> None:
    """
    Delete a quiz topic. Only for admins.
    If topic has questions, it will be soft deleted (marked as inactive).
    If topic has no questions, it will be permanently deleted.
    """
    topic = await TopicRepository.get_by_id(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    success = await TopicRepository.delete(topic_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete topic"
        )


@router.get("/{topic_id}/questions-count")
async def get_topic_questions_count(
    topic_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get the number of questions in a topic.
    """
    from app.repositories.quiz_question import QuestionRepository
    
    topic = await TopicRepository.get_by_id(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    total_questions = await QuestionRepository.count(topic_id=topic_id)
    active_questions = await QuestionRepository.count(topic_id=topic_id, active_only=True)
    
    return {
        "topic_id": topic_id,
        "topic_name": topic.name,
        "total_questions": total_questions,
        "active_questions": active_questions
    }
