from datetime import datetime
from typing import List, Optional

from app.models.product import PremiumCode
from app.repositories.order import OrderRepository
from app.repositories.premium_code import PremiumCodeRepository
from app.repositories.user import UserRepository
from app.services.email import EmailService


class PremiumCodeService:
    @staticmethod
    async def distribute_codes_for_order(order_id: str, background_tasks=None) -> List[PremiumCode]:
        """
        Distribute premium codes to a user based on their order quantity.
        Each order item quantity equals the number of premium codes to send.
        """
        # Get order with items
        order = await OrderRepository.get_with_items(order_id)
        if not order:
            raise ValueError(f"Order {order_id} not found")
        
        # Get user details
        user = await UserRepository.get_by_id(order.user_id)
        if not user or not user.email:
            raise ValueError(f"User not found or no email for order {order_id}")
        
        # Calculate total quantity from all order items
        total_quantity = sum(item.quantity for item in order.items)
        
        if total_quantity <= 0:
            return []
        
        # Check if codes already distributed for this order
        existing_codes = await PremiumCodeRepository.get_codes_by_order(order_id)
        if existing_codes:
            return existing_codes  # Already distributed
        
        # Distribute premium codes
        try:
            distributed_codes = await PremiumCodeRepository.distribute_codes_to_order(
                order_id=order_id,
                user_email=user.email,
                quantity=total_quantity
            )
              # Send email with premium codes
            if distributed_codes:
                premium_codes_data = []
                for code in distributed_codes:
                    premium_codes_data.append({
                        "code": code.code,
                        "description": code.description or "Premium Code",
                        "instructions": "Use this code to access your premium content."
                    })
                
                if background_tasks:
                    # Use background task if available
                    background_tasks.add_task(
                        EmailService.send_premium_code,
                        recipient_email=user.email,
                        customer_name=user.full_name or user.email,
                        order_id=order_id,
                        premium_codes=premium_codes_data,
                        instructions=f"Thank you for your purchase! Here are your {len(distributed_codes)} premium codes."
                    )
                else:
                    # Send email directly if no background tasks available (e.g., in payment callback)
                    await EmailService.send_premium_code(
                        recipient_email=user.email,
                        customer_name=user.full_name or user.email,
                        order_id=order_id,
                        premium_codes=premium_codes_data,
                        instructions=f"Thank you for your purchase! Here are your {len(distributed_codes)} premium codes."
                    )
            
            return distributed_codes
            
        except ValueError as e:
            # Not enough codes available
            raise ValueError(f"Unable to distribute premium codes for order {order_id}: {str(e)}")
    
    @staticmethod
    async def get_user_premium_codes(user_email: str) -> List[PremiumCode]:
        """Get all premium codes distributed to a user's email"""
        return await PremiumCodeRepository.get_codes_by_email(user_email)
    
    @staticmethod
    async def get_order_premium_codes(order_id: str) -> List[PremiumCode]:
        """Get all premium codes distributed for a specific order"""
        return await PremiumCodeRepository.get_codes_by_order(order_id)
    
    @staticmethod
    async def check_available_codes_count() -> int:
        """Check how many premium codes are available for distribution"""
        available_codes = await PremiumCodeRepository.get_available_codes_for_distribution(1000)  # Large number to get count
        return len(available_codes)
