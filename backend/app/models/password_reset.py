from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class PasswordResetRequest(BaseModel):
    """Model for requesting a password reset"""
    email: EmailStr


class PasswordResetToken(BaseModel):
    """Model for password reset token storage"""
    user_id: str
    token: str
    expires_at: datetime
    created_at: datetime
    is_used: bool = False
    
    model_config = {
        "from_attributes": True
    }


class PasswordResetConfirm(BaseModel):
    """Model for confirming a password reset with new password"""
    token: str
    new_password: str
