from datetime import datetime
from typing import Optional

from app.models.user import PyObjectId
from bson import ObjectId
from pydantic import BaseModel, Field


class PaymentMethodSettings(BaseModel):
    """Individual payment method configuration"""
    name: str
    is_enabled: bool = True
    display_name: str
    description: Optional[str] = None
    icon: Optional[str] = None


class PaymentSettingsBase(BaseModel):
    """Payment settings configuration"""
    aamarpay: PaymentMethodSettings = PaymentMethodSettings(
        name="aamarpay",
        is_enabled=True,
        display_name="AamarPay",
        description="Pay securely with AamarPay",
        icon="smartphone"
    )
    cash_on_delivery: PaymentMethodSettings = PaymentMethodSettings(
        name="cash_on_delivery",
        is_enabled=True,
        display_name="Cash on Delivery",
        description="Pay when you receive your order",
        icon="banknote"
    )


class PaymentSettingsCreate(PaymentSettingsBase):
    pass


class PaymentSettingsUpdate(BaseModel):
    """Update payment settings - all fields optional"""
    aamarpay: Optional[PaymentMethodSettings] = None
    cash_on_delivery: Optional[PaymentMethodSettings] = None


class PaymentSettingsInDB(PaymentSettingsBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class PaymentSettings(PaymentSettingsBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


class EnabledPaymentMethods(BaseModel):
    """Response model for enabled payment methods"""
    methods: list[PaymentMethodSettings]
    
    model_config = {
        "populate_by_name": True
    }
