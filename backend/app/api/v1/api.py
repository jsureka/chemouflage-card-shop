from app.api.v1.endpoints import (auth, contact, dashboard, orders, payments,
                                  premium_codes, products, settings)
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments/aamarpay", tags=["payments"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(premium_codes.router, prefix="/premium-codes", tags=["premium-codes"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
