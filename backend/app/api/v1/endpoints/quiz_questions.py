from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_admin, get_current_user
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.quiz import (
    DifficultyLevel,
    Question,
    QuestionCreate,
    QuestionForUser,
    QuestionType,
    QuestionUpdate,
)
from app.models.user import User
from app.repositories.quiz_question import QuestionRepository
from app.repositories.quiz_topic import TopicRepository
from app.utils.pagination import create_paginated_response

router = APIRouter()


@router.post("/", response_model=Question, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_in: QuestionCreate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Create a new quiz question. Only for admins.
    """
    # Validate topic exists
    topic_exists = await TopicRepository.exists(question_in.topic_id)
    if not topic_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic does not exist"
        )
    
    # Validate multiple choice options
    if question_in.question_type == QuestionType.MULTIPLE_CHOICE:
        if not question_in.options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Multiple choice questions must have options"
            )
        
        if not await QuestionRepository.validate_multiple_choice_options(question_in.options):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Multiple choice questions must have 2-5 options with exactly one correct answer"
            )
    elif question_in.options:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only multiple choice questions can have options"
        )
    
    question_id = await QuestionRepository.create(question_in)
    return await QuestionRepository.get_by_id(question_id)


@router.get("/", response_model=PaginatedResponse[Question])
async def get_questions(
    pagination: PaginationParams = Depends(),
    topic_id: Optional[str] = Query(None, description="Filter by topic ID"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty"),
    question_type: Optional[QuestionType] = Query(None, description="Filter by question type"),
    active_only: bool = Query(True, description="Filter only active questions"),
    search: Optional[str] = Query(None, description="Search questions by title"),
    current_user: User = Depends(get_current_admin)  # Only admins can see all questions
) -> Any:
    """
    Get all quiz questions with pagination and filtering. Only for admins.
    """
    questions = await QuestionRepository.get_all(
        skip=pagination.skip,
        limit=pagination.limit,
        topic_id=topic_id,
        difficulty=difficulty,
        question_type=question_type,
        active_only=active_only,
        search=search
    )
    
    total_count = await QuestionRepository.count(
        topic_id=topic_id,
        difficulty=difficulty,
        question_type=question_type,
        active_only=active_only,
        search=search
    )
    
    return await create_paginated_response(
        data=questions,
        page=pagination.page,
        limit=pagination.limit,
        total_count=total_count
    )


@router.get("/public", response_model=PaginatedResponse[QuestionForUser])
async def get_questions_for_users(
    pagination: PaginationParams = Depends(),
    topic_id: Optional[str] = Query(None, description="Filter by topic ID"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty"),
    question_type: Optional[QuestionType] = Query(None, description="Filter by question type"),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get quiz questions for regular users (without correct answers).
    """
    questions = await QuestionRepository.get_all(
        skip=pagination.skip,
        limit=pagination.limit,
        topic_id=topic_id,
        difficulty=difficulty,
        question_type=question_type,
        active_only=True
    )
    
    # Convert to user-safe format
    user_questions = []
    for question in questions:
        user_question = await QuestionRepository.get_for_user(question.id)
        if user_question:
            user_questions.append(user_question)
    
    total_count = await QuestionRepository.count(
        topic_id=topic_id,
        difficulty=difficulty,
        question_type=question_type,
        active_only=True
    )
    
    return await create_paginated_response(
        data=user_questions,
        page=pagination.page,
        limit=pagination.limit,
        total_count=total_count
    )


@router.get("/random", response_model=List[QuestionForUser])
async def get_random_questions(
    limit: int = Query(10, ge=1, le=50, description="Number of random questions"),
    topic_id: Optional[str] = Query(None, description="Filter by topic ID"),
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty"),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get random questions for quiz (without correct answers).
    """
    if topic_id:
        topic_exists = await TopicRepository.exists(topic_id)
        if not topic_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Topic does not exist"
            )
    
    questions = await QuestionRepository.get_random_questions(
        topic_id=topic_id,
        difficulty=difficulty,
        limit=limit
    )
    
    return questions


@router.get("/{question_id}", response_model=Question)
async def get_question(
    question_id: str,
    current_user: User = Depends(get_current_admin)  # Only admins can see full question details
) -> Any:
    """
    Get a specific quiz question by ID. Only for admins.
    """
    question = await QuestionRepository.get_by_id(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question


@router.get("/{question_id}/public", response_model=QuestionForUser)
async def get_question_for_user(
    question_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific quiz question for regular users (without correct answers).
    """
    question = await QuestionRepository.get_for_user(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return question


@router.put("/{question_id}", response_model=Question)
async def update_question(
    question_id: str,
    question_update: QuestionUpdate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Update a quiz question. Only for admins.
    """
    # Check if question exists
    existing_question = await QuestionRepository.get_by_id(question_id)
    if not existing_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Validate topic if being updated
    if question_update.topic_id:
        topic_exists = await TopicRepository.exists(question_update.topic_id)
        if not topic_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Topic does not exist"
            )
    
    # Validate question type and options
    final_question_type = question_update.question_type or existing_question.question_type
    
    if final_question_type == QuestionType.MULTIPLE_CHOICE:
        if question_update.options is not None:  # Options are being updated
            if not question_update.options:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Multiple choice questions must have options"
                )
            
            if not await QuestionRepository.validate_multiple_choice_options(question_update.options):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Multiple choice questions must have 2-5 options with exactly one correct answer"
                )
    else:
        if question_update.options is not None and question_update.options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only multiple choice questions can have options"
            )
    
    updated_question = await QuestionRepository.update(question_id, question_update)
    if not updated_question:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update question"
        )
    
    return updated_question


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_current_admin)
) -> None:
    """
    Delete a quiz question and its options. Only for admins.
    """
    question = await QuestionRepository.get_by_id(question_id)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    success = await QuestionRepository.delete(question_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete question"
        )
    # Do not return anything for 204 responses
