from datetime import timedelta
from typing import Any, List

from app.api.dependencies import (get_current_admin, get_current_user,
                                  get_current_user_profile)
from app.core.config import settings
from app.core.security import create_access_token
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.user import Token, User, UserCreate, UserProfile, UserUpdate
from app.repositories.user import UserRepository, UserRoleRepository
from app.services.email import EmailService
from app.utils.pagination import create_paginated_response
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Register a new user.
    """
    try:
        user_id = await UserRepository.create(user_in)
        user = await UserRepository.get_by_id(user_id)
        
        # Send welcome email in background
        if user and user.email:
            background_tasks.add_task(
                EmailService.send_welcome_email,
                recipient_email=user.email,
                customer_name=user.full_name or user.email
            )
        
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Returns access token with user profile information including role.
    """
    user = await UserRepository.authenticate(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user profile with role information
    user_profile = await UserRepository.get_profile(user.id)
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user_profile
    }

@router.get("/me", response_model=UserProfile)
async def read_users_me(current_user_profile: UserProfile = Depends(get_current_user_profile)) -> Any:
    """
    Get current user with role information.
    This endpoint validates the JWT token from the Authorization header
    and returns the complete user profile including role information.
    """
    return current_user_profile

@router.patch("/users/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate, 
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update own user information.
    """
    user = await UserRepository.update(current_user.id, user_update)
    return user

@router.get("/users", response_model=PaginatedResponse[UserProfile])
async def read_users(
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Retrieve users with pagination. Only for admins.
    """
    users = await UserRepository.get_all(skip=pagination.skip, limit=pagination.limit)
    total_count = await UserRepository.count()
    
    # Convert users to profiles
    result = []
    for user in users:
        profile = await UserRepository.get_profile(user.id)
        if profile:
            result.append(profile)
    
    return await create_paginated_response(
        data=result,
        page=pagination.page,
        limit=pagination.limit,
        total_count=total_count
    )

@router.post("/users/{user_id}/make-admin", response_model=UserProfile)
async def make_admin(
    user_id: str,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Make a user an admin. Only for admins.
    """
    user = await UserRepository.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    await UserRoleRepository.update(user_id, "admin")
    profile = await UserRepository.get_profile(user_id)
    return profile
