import logging
from typing import Any, List, Optional

from app.api.dependencies import get_current_admin, get_current_user
from app.core.config import settings
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.product import (AdminOrderUpdate, Order, OrderCreate,
                                OrderItem, OrderItemCreate, OrderUpdate,
                                OrderWithItems)
from app.models.user import User
from app.repositories.order import OrderItemRepository, OrderRepository
from app.repositories.user import UserRepository, UserRoleRepository
from app.services.email import EmailService
from app.utils.pagination import create_paginated_response
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new order and handle payment initiation if needed.
    """
    logger.info(f"Creating order for user {current_user.id} with payment method: {order_in.payment_method}")# Ensure the user can only create orders for themselves
    if order_in.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create orders for yourself"
        )
      # Validate payment method is enabled
    if order_in.payment_method:
        from app.db.mongodb import get_database
        from app.repositories.payment_settings import PaymentSettingsRepository
        
        db = await get_database()
        payment_settings_repo = PaymentSettingsRepository(db)
        payment_settings = await payment_settings_repo.get_settings()
        
        if payment_settings:
            method_enabled = False
            if order_in.payment_method == "aamarpay" and payment_settings.aamarpay.is_enabled:
                method_enabled = True
            elif order_in.payment_method == "cash_on_delivery" and payment_settings.cash_on_delivery.is_enabled:
                method_enabled = True
            
            if not method_enabled:                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Payment method '{order_in.payment_method}' is not available"
                )
    
    order_id = await OrderRepository.create(order_in)
    order = await OrderRepository.get_by_id(order_id)
    logger.info(f"Order {order_id} created successfully")
    
    # Create order items if provided
    if order_in.items and len(order_in.items) > 0:
        logger.info(f"Creating {len(order_in.items)} order items for order {order_id}")
        for item_data in order_in.items:
            item_create = OrderItemCreate(
                order_id=order_id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                price=item_data["price"]
            )
            await OrderItemRepository.create(item_create)
        logger.info(f"Order items created successfully for order {order_id}")
      # Handle AamarPay payment initiation
    if order_in.payment_method == "aamarpay":
        try:
            from app.services.aamarpay import aamarpay_service

            # Prepare customer information - shipping_address is a Pydantic model, not a dict
            customer_name = f"{order_in.shipping_address.firstName} {order_in.shipping_address.lastName}".strip()
            customer_email = current_user.email
            customer_phone = order_in.shipping_address.phone
            customer_address = order_in.shipping_address.address
            customer_city = order_in.shipping_address.city
            
            # Create payment request
            payment_result = aamarpay_service.create_payment(
                order_id=order_id,
                amount=order_in.total_amount,
                customer_name=customer_name or current_user.username or "Customer",
                customer_email=customer_email,
                customer_phone=customer_phone,
                customer_address=customer_address,
                customer_city=customer_city,
                description=f"Payment for Order #{order_id}"
            )
            if payment_result.get("success"):
                # Return order details with payment URL
                return {
                    "order": order.model_dump(),
                    "payment_required": True,
                    "payment_url": payment_result["payment_url"],
                    "transaction_id": payment_result["transaction_id"],
                    "message": "Order created successfully. Please complete payment."
                }
            else:
                # Payment initiation failed, but order was created
                return {
                    "order": order.model_dump(),
                    "payment_required": True,
                    "payment_error": payment_result.get("error", "Failed to initiate payment"),
                    "message": "Order created but payment initiation failed. Please try again or contact support."
                }
        except Exception as e:
            # Payment initiation failed, but order was created
            logger.error(f"Payment initiation failed for order {order_id}: {str(e)}")
            logger.error(f"Exception details: {type(e).__name__}: {str(e)}")
            
            return {
                "order": order.model_dump(),
                "payment_required": True,
                "payment_error": f"Payment initiation error: {str(e)}",
                "message": "Order created but payment initiation failed. Please try again or contact support."
            }
    
    # For cash on delivery or other payment methods
    # Get order with items for email
    order_with_items = await OrderRepository.get_with_items(order_id)
    
    if order_with_items and current_user.email:
        # Prepare order items for email
        order_items = []
        total_amount = 0
        for item in order_with_items.items:
            order_items.append({
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
                "description": getattr(item, 'description', '')
            })
            total_amount += item.price * item.quantity
        
        # Create tracking URL
        tracking_url = f"{settings.FRONTEND_URL}/track/{order_id}"
        
        # Send order confirmation email in background
        background_tasks.add_task(
            EmailService.send_order_confirmation,
            recipient_email=current_user.email,
            customer_name=current_user.username or current_user.email,
            order_id=order_id,
            order_items=order_items,
            total_amount=total_amount,
            tracking_url=tracking_url
        )
    
    return {
        "order": order.model_dump(),
        "payment_required": False,
        "message": "Order created successfully."
    }

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

@router.get("/", response_model=PaginatedResponse[Order])
async def read_orders(
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Retrieve orders. Only for admins.
    """
    orders = await OrderRepository.get_all(skip=pagination.skip, limit=pagination.limit)
    total_count = await OrderRepository.count()
    return await create_paginated_response(orders, pagination.page, pagination.limit, total_count)

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
    background_tasks: BackgroundTasks,
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
    
    # Send email notification if admin changed status
    if is_admin and order_in.status:
        user = await UserRepository.get_by_id(order.user_id)
        if user and user.email:
            tracking_url = f"{settings.FRONTEND_URL}/track/{order_id}"
            
            # Send status update email in background
            background_tasks.add_task(
                EmailService.send_order_status_update,
                recipient_email=user.email,
                customer_name=user.full_name or user.email,
                order_id=order_id,
                status=order_in.status,
                tracking_url=tracking_url
            )
    
    return updated_order

@router.put("/admin/{order_id}", response_model=Order)
async def admin_update_order(
    order_id: str,
    order_in: AdminOrderUpdate,
    background_tasks: BackgroundTasks,
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
    
    # Get the user details for email notification
    user = await UserRepository.get_by_id(order.user_id)
    
    updated_order = await OrderRepository.update_admin(order_id, order_in)
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )
      # Send email notification if status changed and user has email
    if order_in.status and user and user.email:
        tracking_url = f"{settings.FRONTEND_URL}/track/{order_id}"
        
        # Send status update email in background
        background_tasks.add_task(
            EmailService.send_order_status_update,
            recipient_email=user.email,
            customer_name=user.full_name or user.email,
            order_id=order_id,
            status=order_in.status,
            tracking_url=tracking_url,
            additional_message=getattr(order_in, 'notes', None)
        )
        
        # Send specific email for shipped status
        if order_in.status == "shipped":
            background_tasks.add_task(
                EmailService.send_shipping_notification,
                recipient_email=user.email,
                customer_name=user.full_name or user.email,
                order_id=order_id,
                tracking_number=getattr(order_in, 'tracking_number', None),
                carrier_name=getattr(order_in, 'carrier_name', None),
                shipping_method=getattr(order_in, 'shipping_method', None),
                estimated_delivery=getattr(order_in, 'estimated_delivery', None),
                tracking_url=tracking_url,
                additional_message=getattr(order_in, 'notes', None)
            )
        
        # Send cancellation email for cancelled status
        elif order_in.status == "cancelled":
            background_tasks.add_task(
                EmailService.send_order_cancellation,
                recipient_email=user.email,
                customer_name=user.full_name or user.email,
                order_id=order_id,
                cancellation_reason=getattr(order_in, 'cancellation_reason', None),
                additional_message=getattr(order_in, 'notes', None)
            )
        
        # If order has premium codes and status is completed/shipped, send premium codes
        if order_in.status in ["completed", "shipped"] and hasattr(updated_order, 'premium_codes'):
            order_details = await OrderRepository.get_with_premium_code(order_id)
            if order_details and order_details.get('premium_codes'):
                premium_codes = []
                for code in order_details['premium_codes']:
                    premium_codes.append({
                        "code": code.get('code', ''),
                        "product_name": code.get('product_name', ''),
                        "instructions": code.get('instructions', '')
                    })
                
                if premium_codes:
                    background_tasks.add_task(
                        EmailService.send_premium_code,
                        recipient_email=user.email,
                        customer_name=user.full_name or user.email,
                        order_id=order_id,
                        premium_codes=premium_codes,
                        instructions="Your premium codes are ready! Use these codes to access your digital content."
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
