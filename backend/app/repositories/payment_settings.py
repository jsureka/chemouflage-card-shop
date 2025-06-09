from datetime import datetime
from typing import List, Optional

from app.core.config import settings
from app.models.settings import (EnabledPaymentMethods, PaymentMethodSettings,
                                 PaymentSettings, PaymentSettingsCreate,
                                 PaymentSettingsInDB, PaymentSettingsUpdate)
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument


class PaymentSettingsRepository:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.payment_settings

    async def get_settings(self) -> Optional[PaymentSettings]:
        """Get payment settings - creates default if none exist"""
        settings_doc = await self.collection.find_one()
        
        if not settings_doc:
            # Create default settings
            default_settings = PaymentSettingsCreate()
            created_settings = await self.create_settings(default_settings)
            return created_settings
        
        # Convert MongoDB document to PaymentSettings model
        settings_doc["id"] = str(settings_doc["_id"])
        del settings_doc["_id"]
        return PaymentSettings(**settings_doc)

    async def create_settings(self, settings_data: PaymentSettingsCreate) -> PaymentSettings:
        """Create new payment settings"""
        settings_dict = settings_data.model_dump()
        settings_dict["created_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(settings_dict)
        created_settings = await self.collection.find_one({"_id": result.inserted_id})
        
        # Convert MongoDB document to PaymentSettings model
        created_settings["id"] = str(created_settings["_id"])
        del created_settings["_id"]
        return PaymentSettings(**created_settings)

    async def update_settings(self, settings_update: PaymentSettingsUpdate) -> Optional[PaymentSettings]:
        """Update payment settings"""
        update_data = {}
        
        # Build update document
        if settings_update.aamarpay is not None:
            update_data["aamarpay"] = settings_update.aamarpay.model_dump()
        
        if settings_update.cash_on_delivery is not None:
            update_data["cash_on_delivery"] = settings_update.cash_on_delivery.model_dump()
        
        if not update_data:
            # If no updates, return current settings
            return await self.get_settings()
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update the first (and should be only) settings document
        updated_doc = await self.collection.find_one_and_update(
            {},  # Update any existing settings document
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        
        if updated_doc:
            # Convert MongoDB document to PaymentSettings model
            updated_doc["id"] = str(updated_doc["_id"])
            del updated_doc["_id"]
            return PaymentSettings(**updated_doc)
        
        return None

    async def get_enabled_payment_methods(self) -> EnabledPaymentMethods:
        """Get only enabled payment methods for public use"""
        settings = await self.get_settings()
        enabled_methods = []
        
        if settings.aamarpay.is_enabled:
            enabled_methods.append(settings.aamarpay)
        
        if settings.cash_on_delivery.is_enabled:
            enabled_methods.append(settings.cash_on_delivery)
        
        return EnabledPaymentMethods(methods=enabled_methods)

    async def toggle_payment_method(self, method_name: str, enabled: bool) -> Optional[PaymentSettings]:
        """Toggle a specific payment method on/off"""
        if method_name not in ["aamarpay", "cash_on_delivery"]:
            return None
        
        update_data = {
            f"{method_name}.is_enabled": enabled,
            "updated_at": datetime.utcnow()
        }
        
        updated_doc = await self.collection.find_one_and_update(
            {},
            {"$set": update_data},
            return_document=ReturnDocument.AFTER
        )
        
        if updated_doc:
            # Convert MongoDB document to PaymentSettings model
            updated_doc["id"] = str(updated_doc["_id"])
            del updated_doc["_id"]
            return PaymentSettings(**updated_doc)
        
        return None

    async def validate_at_least_one_enabled(self, settings_update: PaymentSettingsUpdate) -> bool:
        """Validate that at least one payment method will remain enabled after update"""
        current_settings = await self.get_settings()
        
        # Check what the settings would be after update
        aamarpay_enabled = current_settings.aamarpay.is_enabled
        cod_enabled = current_settings.cash_on_delivery.is_enabled
        
        if settings_update.aamarpay is not None:
            aamarpay_enabled = settings_update.aamarpay.is_enabled
        
        if settings_update.cash_on_delivery is not None:
            cod_enabled = settings_update.cash_on_delivery.is_enabled
        
        return aamarpay_enabled or cod_enabled
