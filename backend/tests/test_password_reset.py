import json
from unittest.mock import AsyncMock, patch

import pytest
from app.api.v1.endpoints.auth import router as auth_router
from app.models.password_reset import (PasswordResetConfirm,
                                       PasswordResetRequest)
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
app.include_router(auth_router, prefix="/api/v1/auth")
client = TestClient(app)

@pytest.mark.asyncio
@patch('app.repositories.user.UserRepository.get_by_email')
@patch('app.repositories.password_reset.PasswordResetTokenRepository.create_token')
async def test_forgot_password_endpoint(mock_create_token, mock_get_by_email):
    # Setup mocks
    mock_user = AsyncMock()
    mock_user.id = "test_user_id"
    mock_user.email = "test@example.com"
    mock_user.full_name = "Test User"
    
    mock_get_by_email.return_value = mock_user
    mock_create_token.return_value = "test_token"
    
    # Test the endpoint
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@example.com"}
    )
    
    # Verify response
    assert response.status_code == 202
    data = response.json()
    assert "message" in data
    assert "If your email is registered" in data["message"]
    
    # Verify mocks were called correctly
    mock_get_by_email.assert_called_once_with("test@example.com")
    mock_create_token.assert_called_once_with("test_user_id")

@pytest.mark.asyncio
@patch('app.repositories.password_reset.PasswordResetTokenRepository.is_token_valid')
@patch('app.repositories.password_reset.PasswordResetTokenRepository.get_by_token')
@patch('app.repositories.user.UserRepository.update_password')
@patch('app.repositories.password_reset.PasswordResetTokenRepository.mark_as_used')
async def test_reset_password_endpoint(mock_mark_as_used, mock_update_password, 
                                     mock_get_by_token, mock_is_token_valid):
    # Setup mocks
    mock_is_token_valid.return_value = True
    
    mock_token = AsyncMock()
    mock_token.user_id = "test_user_id"
    mock_get_by_token.return_value = mock_token
    
    mock_update_password.return_value = True
    mock_mark_as_used.return_value = True
    
    # Test the endpoint
    response = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": "test_token",
            "new_password": "new_secure_password"
        }
    )
    
    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "successfully" in data["message"]
    
    # Verify mocks were called correctly
    mock_is_token_valid.assert_called_once_with("test_token")
    mock_get_by_token.assert_called_once_with("test_token")
    mock_update_password.assert_called_once_with("test_user_id", "new_secure_password")
    mock_mark_as_used.assert_called_once_with("test_token")
