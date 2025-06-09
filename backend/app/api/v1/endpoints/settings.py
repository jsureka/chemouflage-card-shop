from typing import List

from app.api.dependencies import get_current_admin, get_current_user
from app.db.mongodb import get_database
from app.models.settings import (EnabledPaymentMethods, PaymentSettings,
                                 PaymentSettingsUpdate)
from app.models.user import User
from app.repositories.payment_settings import PaymentSettingsRepository
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter()


@router.get("/payment-methods", response_model=EnabledPaymentMethods)
async def get_enabled_payment_methods(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get enabled payment methods for public use (checkout page)
    """
    payment_settings_repo = PaymentSettingsRepository(db)
    return await payment_settings_repo.get_enabled_payment_methods()


@router.get("/payment-settings", response_model=PaymentSettings)
async def get_payment_settings(
    current_user: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get payment settings (admin only)
    """
    payment_settings_repo = PaymentSettingsRepository(db)
    settings = await payment_settings_repo.get_settings()
    
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment settings not found"
        )
    
    return settings


@router.put("/payment-settings", response_model=PaymentSettings)
async def update_payment_settings(
    settings_update: PaymentSettingsUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update payment settings (admin only)
    """
    payment_settings_repo = PaymentSettingsRepository(db)
    
    # Validate that at least one payment method will remain enabled
    is_valid = await payment_settings_repo.validate_at_least_one_enabled(settings_update)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one payment method must remain enabled"
        )
    
    updated_settings = await payment_settings_repo.update_settings(settings_update)
    
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to update payment settings"
        )
    
    return updated_settings


@router.post("/payment-methods/{method_name}/toggle")
async def toggle_payment_method(
    method_name: str,
    enabled: bool,
    current_user: User = Depends(get_current_admin),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Toggle a specific payment method on/off (admin only)
    """
    if method_name not in ["aamarpay", "cash_on_delivery"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment method name"
        )
    
    payment_settings_repo = PaymentSettingsRepository(db)
    
    # If trying to disable, check that at least one method will remain enabled
    if not enabled:
        current_settings = await payment_settings_repo.get_settings()
        other_method = "cash_on_delivery" if method_name == "aamarpay" else "aamarpay"
        
        other_enabled = (
            current_settings.cash_on_delivery.is_enabled 
            if other_method == "cash_on_delivery" 
            else current_settings.aamarpay.is_enabled
        )
        
        if not other_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disable the last remaining payment method"
            )
    
    updated_settings = await payment_settings_repo.toggle_payment_method(method_name, enabled)
    
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failed to toggle payment method"
        )
    
    return {"message": f"Payment method {method_name} {'enabled' if enabled else 'disabled'} successfully"}
