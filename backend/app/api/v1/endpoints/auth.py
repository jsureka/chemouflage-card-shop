from datetime import datetime, timedelta
from typing import Any, List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, ValidationError

from app.api.dependencies import (
    get_current_admin,
    get_current_user,
    get_current_user_profile,
)
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.password_reset import PasswordResetConfirm, PasswordResetRequest
from app.models.user import (
    FirebaseLoginRequest,
    FirebaseUserCreate,
    Token,
    TokenPayload,
    User,
    UserCreate,
    UserProfile,
    UserUpdate,
)
from app.repositories.password_reset import PasswordResetTokenRepository
from app.repositories.token import RefreshTokenRepository
from app.repositories.user import UserRepository, UserRoleRepository
from app.services.email import EmailService
from app.services.firebase_auth import firebase_auth_service
from app.utils.pagination import create_paginated_response

router = APIRouter()

# Define model for refresh token request
class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks
) -> Any:
    """
    Register a new user.
    """
    try:
        # Register user in Firebase first
        firebase_result = await firebase_auth_service.register_with_email_password(
            email=user_in.email,
            password=user_in.password,
            display_name=user_in.full_name
        )
        if firebase_result is None:
            # If Firebase says email exists, allow local registration to continue
            # Otherwise, raise error
            from httpx import HTTPStatusError

            # Firebase error response is in the form {"error": {"message": ...}}
            # But our method logs and returns None on any error, so we can't distinguish here
            # So, just proceed (worst case: user already exists in Firebase)
            pass
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
    OAuth2 compatible token login, get an access token and refresh token for future requests.
    Returns access token, refresh token with user profile information including role.
    """
    user = await UserRepository.authenticate(form_data.username, form_data.password)
    if not user:
        # Try Firebase email/password authentication
        firebase_data = await firebase_auth_service.authenticate_with_email_password(form_data.username, form_data.password)
        if firebase_data and firebase_data.get("localId"):
            # Prepare FirebaseUserCreate model
            from app.models.user import FirebaseUserCreate
            firebase_user = FirebaseUserCreate(
                firebase_uid=firebase_data["localId"],
                email=firebase_data["email"],
                full_name=firebase_data.get("displayName"),
                avatar_url=firebase_data.get("photoUrl"),
                email_verified=firebase_data.get("emailVerified", False)
            )
            user_id = await UserRepository.create_firebase_user(firebase_user)
            user = await UserRepository.get_by_id(user_id)
        else:
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

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Create refresh token
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        subject=user.id, expires_delta=refresh_token_expires
    )

    # Store refresh token in database
    await RefreshTokenRepository.create(
        user_id=user.id,
        token=refresh_token,
        expires_delta=refresh_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_profile
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshTokenRequest) -> Any:
    """
    Get a new access token using a refresh token.
    """
    # Verify refresh token validity
    is_valid = await RefreshTokenRepository.is_token_valid(refresh_request.refresh_token)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Decode the refresh token
        payload = jwt.decode(
            refresh_request.refresh_token, 
            settings.REFRESH_TOKEN_SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        # Verify token type
        if token_data.token_type != "refresh_token":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from token data
        user_id = token_data.sub
        user_profile = await UserRepository.get_profile(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        
        # Create a new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            subject=user_id, expires_delta=access_token_expires
        )
        
        # Return the new access token
        return {
            "access_token": access_token,
            "refresh_token": refresh_request.refresh_token,  # Return the same refresh token
            "token_type": "bearer",
            "user": user_profile
        }
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

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

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(refresh_request: RefreshTokenRequest) -> None:
    """
    Logout user by revoking the refresh token.
    """
    # Revoke the refresh token
    await RefreshTokenRepository.revoke(refresh_request.refresh_token)
    return None


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(current_user: User = Depends(get_current_user)) -> None:
    """
    Logout from all devices by revoking all refresh tokens for the user.
    """
    await RefreshTokenRepository.revoke_all_for_user(current_user.id)
    return None


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks
) -> dict:
    """
    Request a password reset. Sends an email with a reset link.
    Returns 202 Accepted regardless of whether the email exists for security reasons.
    """
    # Try to find the user by email
    user = await UserRepository.get_by_email(request.email)
    
    # If user exists, create reset token and send email
    if user:
        # Create password reset token
        token = await PasswordResetTokenRepository.create_token(str(user.id))
        
        # Generate reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        # Calculate expiry date for email
        expiry_hours = settings.PASSWORD_RESET_TOKEN_EXPIRE_HOURS
        expiry_date = (datetime.utcnow() + timedelta(hours=expiry_hours)).strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # Send reset email in background
        background_tasks.add_task(
            EmailService.send_password_reset,
            recipient_email=user.email,
            customer_name=user.full_name or user.email,
            reset_link=reset_link,
            expiry_hours=expiry_hours,
            expiry_date=expiry_date
        )
    
    # Always return success for security (don't reveal if email exists)
    return {"message": "If your email is registered, you will receive a password reset link."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(reset_data: PasswordResetConfirm) -> dict:
    """
    Reset a user's password using a valid reset token.
    """
    # Verify the token is valid
    is_valid = await PasswordResetTokenRepository.is_token_valid(reset_data.token)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )
    
    # Get token details
    token_data = await PasswordResetTokenRepository.get_by_token(reset_data.token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token not found"
        )
    
    # Get user by id
    user = await UserRepository.get_by_id(token_data.user_id)
    # Update user's password in MongoDB
    success = await UserRepository.update_password(token_data.user_id, reset_data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password"
        )
    # Also update password in Firebase if user has firebase_uid or exists in Firebase
    if user and user.email:
        await firebase_auth_service.update_password_with_email(user.email, reset_data.new_password)
    # Mark token as used
    await PasswordResetTokenRepository.mark_as_used(reset_data.token)
    
    return {"message": "Password has been reset successfully."}

@router.post("/firebase-login", response_model=Token)
async def firebase_login(firebase_request: FirebaseLoginRequest) -> Any:
    """
    Firebase authentication login.
    Verify Firebase ID token and create/login user.
    """
    from app.services.firebase_auth import firebase_auth_service

    # Verify Firebase ID token
    firebase_data = await firebase_auth_service.verify_id_token(firebase_request.id_token)
    if not firebase_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user exists in our database
    user = await UserRepository.get_by_firebase_uid(firebase_data['uid'])
    
    if not user:
        # Create new user from Firebase data
        firebase_user = FirebaseUserCreate(
            firebase_uid=firebase_data['uid'],
            email=firebase_data['email'],
            full_name=firebase_data.get('name'),
            avatar_url=firebase_data.get('picture'),
            email_verified=firebase_data.get('email_verified', False)
        )
        
        try:
            user_id = await UserRepository.create_firebase_user(firebase_user)
            user = await UserRepository.get_by_id(user_id)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create or retrieve user"
        )
    
    # Get user profile with role information
    user_profile = await UserRepository.get_profile(user.id)
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(
        subject=user.id, expires_delta=refresh_token_expires
    )
    
    # Store refresh token in database
    await RefreshTokenRepository.create(
        user_id=user.id,
        token=refresh_token,
        expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_profile
    }
