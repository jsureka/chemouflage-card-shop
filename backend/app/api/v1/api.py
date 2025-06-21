from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    contact,
    dashboard,
    orders,
    payments,
    premium_codes,
    products,
    quiz_questions,
    quiz_stats,
    quiz_topics,
    settings,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payments.router, prefix="/payments/aamarpay", tags=["payments"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(premium_codes.router, prefix="/premium-codes", tags=["premium-codes"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

# Quiz system routes
api_router.include_router(quiz_topics.router, prefix="/quiz/topics", tags=["quiz-topics"])
api_router.include_router(quiz_questions.router, prefix="/quiz/questions", tags=["quiz-questions"])
api_router.include_router(quiz_stats.router, prefix="/quiz/stats", tags=["quiz-statistics"])
