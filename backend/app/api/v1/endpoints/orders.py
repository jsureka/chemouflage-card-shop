from typing import Any, List, Optional

from app.api.dependencies import get_current_admin, get_current_user
from app.models.product import (AdminOrderUpdate, Order, OrderCreate,
                                OrderItem, OrderItemCreate, OrderUpdate,
                                OrderWithItems)
from app.models.user import User
from app.repositories.order import OrderItemRepository, OrderRepository
from app.repositories.user import UserRoleRepository
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()

@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new order.
    """
    # Ensure the user can only create orders for themselves
    if order_in.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create orders for yourself"
        )
    
    order_id = await OrderRepository.create(order_in)
    return await OrderRepository.get_by_id(order_id)

@router.post("/items", response_model=OrderItem)
async def create_order_item(
    item_in: OrderItemCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Add an item to an order.
    """
    # Get the order to check permissions
    order = await OrderRepository.get_by_id(item_in.order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check that the order belongs to the current user or user is admin
    is_admin = await UserRoleRepository.is_admin(current_user.id)
    if order.user_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own orders"
        )
    
    item_id = await OrderItemRepository.create(item_in)
    return await OrderItemRepository.get_by_id(item_id)

@router.get("/", response_model=List[Order])
async def read_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Retrieve orders. Only for admins.
    """
    orders = await OrderRepository.get_all(skip=skip, limit=limit)
    return orders

@router.get("/my-orders", response_model=List[Order])
async def read_my_orders(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve orders for the current user.
    """
    orders = await OrderRepository.get_by_user(current_user.id)
    return orders

@router.get("/{order_id}", response_model=OrderWithItems)
async def read_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific order by ID.
    """
    order = await OrderRepository.get_with_items(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check that the order belongs to the current user or user is admin
    is_admin = await UserRoleRepository.is_admin(current_user.id)
    if order.user_id != current_user.id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own orders"
        )
    
    return order

@router.get("/admin/{order_id}/details")
async def admin_get_order_details(
    order_id: str,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Get detailed order information including premium code data (admin only).
    """
    order_details = await OrderRepository.get_with_premium_code(order_id)
    if not order_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order_details

@router.put("/{order_id}", response_model=Order)
async def update_order(
    order_id: str,
    order_in: OrderUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update an order status (admin) or address details (owner).
    """
    order = await OrderRepository.get_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check permissions
    is_admin = await UserRoleRepository.is_admin(current_user.id)
    is_owner = order.user_id == current_user.id
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own orders"
        )
    
    # Apply more restricted updates for non-admins
    if not is_admin and order_in.status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Regular users cannot change order status"
        )
    
    updated_order = await OrderRepository.update(order_id, order_in)
    return updated_order

@router.put("/admin/{order_id}", response_model=Order)
async def admin_update_order(
    order_id: str,
    order_in: AdminOrderUpdate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Admin-only order update with automatic premium code binding.
    """
    order = await OrderRepository.get_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    updated_order = await OrderRepository.update_admin(order_id, order_in)
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )
    
    return updated_order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: str,
    current_user: User = Depends(get_current_admin)
):
    """
    Delete an order. Only for admins.
    """
    order = await OrderRepository.get_by_id(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    success = await OrderRepository.delete(order_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete order"
        )

@router.get("/track/{order_id}", response_model=OrderWithItems)
async def track_order(
    order_id: str
) -> Any:
    """
    Track an order by ID. No authentication required.
    This endpoint is designed for public tracking pages.
    """
    order = await OrderRepository.get_with_items(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order
