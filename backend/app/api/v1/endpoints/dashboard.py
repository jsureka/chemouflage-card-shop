from typing import Any, Dict

from app.api.dependencies import get_current_admin
from app.models.user import User
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.repositories.user import UserRepository
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.get("/stats", response_model=Dict[str, Any])
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Get dashboard statistics. Only for admins.
    """
    total_products = await ProductRepository.count()
    total_orders = await OrderRepository.count()
    total_revenue = await OrderRepository.get_total_revenue()
    total_customers = await UserRepository.count()
    return {
    "totalProducts": total_products,
    "totalOrders": total_orders,
    "totalRevenue": total_revenue,
    "totalCustomers": total_customers,
    "change": {
        "products": "+12.5%",  # Mock data, would be calculated from historical data
        "orders": "+8.2%",
        "revenue": "+15.3%",
        "customers": "+4.1%"
    }
}
