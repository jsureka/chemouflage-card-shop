import logging
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse

from app.api.dependencies import get_current_user
from app.models.user import User
from app.repositories.order import OrderRepository
from app.services.aamarpay import aamarpay_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/success")
async def aamarpay_success_callback(request: Request) -> Any:
    """
    Handle successful AamarPay payment callback
    """
    try:
        # Get form data from AamarPay callback
        form_data = await request.form()
        payment_data = dict(form_data)
        
        # Verify the payment
        verification_result = aamarpay_service.verify_payment(payment_data)
        
        if not verification_result.get("success"):
            return RedirectResponse(
                url=f"{aamarpay_service.frontend_url}/payment/failed?error={verification_result.get('error', 'Payment verification failed')}",
                status_code=status.HTTP_302_FOUND
            )
          # Extract order ID and update order status
        order_id = verification_result.get("order_id")
        if order_id:
            # Update order payment status
            from fastapi import BackgroundTasks

            from app.models.product import OrderUpdate
            from app.services.premium_code_service import PremiumCodeService
            
            update_data = OrderUpdate(
                payment_status="paid" if verification_result.get("payment_status") == "success" else "failed"
            )
            
            updated_order = await OrderRepository.update(order_id, update_data)
            
            # If payment was successful, distribute premium codes
            if (updated_order and 
                verification_result.get("payment_status") == "success"):
                
                try:
                    # Distribute premium codes based on order quantity
                    await PremiumCodeService.distribute_codes_for_order(order_id)
                except Exception as e:
                    logger.error(f"Failed to distribute premium codes for order {order_id}: {str(e)}")
                    # Continue with success redirect even if code distribution fails
            
            if updated_order:
                # Redirect to success page with order details
                return RedirectResponse(
                    url=f"{aamarpay_service.frontend_url}/payment/success?order_id={order_id}&transaction_id={verification_result.get('transaction_id')}",
                    status_code=status.HTTP_302_FOUND
                )
        
        # If we can't find the order, redirect to error page
        return RedirectResponse(
            url=f"{aamarpay_service.frontend_url}/payment/failed?error=Order not found",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        return RedirectResponse(
            url=f"{aamarpay_service.frontend_url}/payment/failed?error=Payment processing error",
            status_code=status.HTTP_302_FOUND
        )


@router.post("/fail")
async def aamarpay_fail_callback(request: Request) -> Any:
    """
    Handle failed AamarPay payment callback
    """
    try:
        # Get form data from AamarPay callback
        form_data = await request.form()
        payment_data = dict(form_data)
        
        # Extract order ID if available
        order_id = payment_data.get("opt_a")
        transaction_id = payment_data.get("mer_txnid")
        
        if order_id:
            # Update order payment status to failed
            from app.models.product import OrderUpdate
            update_data = OrderUpdate(payment_status="failed")
            await OrderRepository.update(order_id, update_data)
        
        # Redirect to failure page
        return RedirectResponse(
            url=f"{aamarpay_service.frontend_url}/payment/failed?order_id={order_id}&transaction_id={transaction_id}&reason=payment_failed",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        return RedirectResponse(
            url=f"{aamarpay_service.frontend_url}/payment/failed?error=Payment processing error",
            status_code=status.HTTP_302_FOUND
        )


@router.post("/cancel")
async def aamarpay_cancel_callback(request: Request) -> Any:
    """
    Handle cancelled AamarPay payment callback
    """
    try:
        # Get form data from AamarPay callback
        form_data = await request.form()
        payment_data = dict(form_data)
        
        # Extract order ID if available
        order_id = payment_data.get("opt_a")
        transaction_id = payment_data.get("mer_txnid")
        
        if order_id:
            # Update order payment status to cancelled
            from app.models.product import OrderUpdate
            update_data = OrderUpdate(payment_status="cancelled")
            await OrderRepository.update(order_id, update_data)
        
        # Redirect to cancellation page
        return RedirectResponse(
            url=f"{aamarpay_service.frontend_url}/payment/cancelled?order_id={order_id}&transaction_id={transaction_id}",
            status_code=status.HTTP_302_FOUND
        )
        
    except Exception as e:
        return RedirectResponse(
            url=f"{aamarpay_service.frontend_url}/payment/failed?error=Payment processing error",
            status_code=status.HTTP_302_FOUND
        )


@router.post("/initiate")
async def initiate_aamarpay_payment(
    order_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Initiate AamarPay payment for an order
    """
    try:
        # Get order details
        order = await OrderRepository.get_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if user owns this order or is admin
        from app.repositories.user import UserRoleRepository
        is_admin = await UserRoleRepository.is_admin(current_user.id)
        if order.user_id != current_user.id and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only initiate payment for your own orders"
            )
        
        # Check if order is in correct status for payment
        if order.payment_status not in ["pending", "failed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order payment has already been processed or is not eligible for payment"
            )
          # Create payment request
        customer_name = f"{order.shipping_address.firstName} {order.shipping_address.lastName}".strip()
        customer_email = current_user.email
        customer_phone = order.shipping_address.phone
        customer_address = order.shipping_address.address
        customer_city = order.shipping_address.city
        
        payment_result = aamarpay_service.create_payment(
            order_id=order_id,
            amount=order.total_amount,
            customer_name=customer_name or current_user.full_name or "Customer",
            customer_email=customer_email,
            customer_phone=customer_phone,
            customer_address=customer_address,
            customer_city=customer_city,
            description=f"Payment for Order #{order_id}"
        )
        
        if payment_result.get("success"):
            return {
                "success": True,
                "payment_url": payment_result["payment_url"],
                "transaction_id": payment_result["transaction_id"],
                "message": "Payment initiated successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initiate payment: {payment_result.get('error', 'Unknown error')}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment initiation error: {str(e)}"
        )


@router.get("/status/{transaction_id}")
async def check_payment_status(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Check AamarPay payment status
    """
    try:
        status_result = aamarpay_service.check_payment_status(transaction_id)
        return {
            "success": status_result.get("success", False),
            "data": status_result.get("data"),
            "error": status_result.get("error")
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Status check error: {str(e)}"
        }
