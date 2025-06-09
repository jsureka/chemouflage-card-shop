import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import settings
from fastapi import HTTPException
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from jinja2 import Environment, FileSystemLoader

# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    TEMPLATE_FOLDER=Path(__file__).parent / "templates",
)

# Initialize FastMail
fastmail = FastMail(conf)

# Jinja2 environment for template rendering
template_env = Environment(
    loader=FileSystemLoader(Path(__file__).parent / "templates")
)

class EmailService:
    @staticmethod
    async def send_email(
        recipients: List[str],
        subject: str,
        template_name: str,
        template_data: Dict[str, Any],
        attachments: Optional[List] = None
    ) -> bool:
        """
        Send an email using a template
        """
        try:
            # Render the template
            template = template_env.get_template(template_name)
            html_content = template.render(**template_data)
            
            # Create message
            message = MessageSchema(
                subject=subject,
                recipients=recipients,
                body=html_content,
                subtype=MessageType.html,
                attachments=attachments or []
            )
            
            # Send email
            await fastmail.send_message(message)
            return True
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
    
    @staticmethod
    async def send_order_confirmation(
        recipient_email: str,
        customer_name: str,
        order_id: str,
        order_items: List[Dict],
        total_amount: float,
        tracking_url: str
    ) -> bool:
        """
        Send order confirmation email
        """
        template_data = {
            "customer_name": customer_name,
            "order_id": order_id,
            "order_items": order_items,
            "total_amount": total_amount,
            "tracking_url": tracking_url,
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject=f"Order Confirmation #{order_id}",
            template_name="order_confirmation.html",
            template_data=template_data
        )
    
    @staticmethod
    async def send_order_status_update(
        recipient_email: str,
        customer_name: str,
        order_id: str,
        status: str,
        tracking_url: str,
        additional_message: Optional[str] = None
    ) -> bool:
        """
        Send order status update email
        """
        status_messages = {
            "pending": "Your order is being processed",
            "confirmed": "Your order has been confirmed",
            "shipped": "Your order has been shipped",
            "delivered": "Your order has been delivered",
            "cancelled": "Your order has been cancelled"
        }
        
        template_data = {
            "customer_name": customer_name,
            "order_id": order_id,
            "status": status,
            "status_message": status_messages.get(status, "Your order status has been updated"),
            "tracking_url": tracking_url,
            "additional_message": additional_message,
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject=f"Order Update #{order_id} - {status.title()}",
            template_name="order_status_update.html",
            template_data=template_data
        )
    
    @staticmethod
    async def send_premium_code(
        recipient_email: str,
        customer_name: str,
        order_id: str,
        premium_codes: List[Dict],
        instructions: Optional[str] = None
    ) -> bool:
        """
        Send premium code email
        """
        template_data = {
            "customer_name": customer_name,
            "order_id": order_id,
            "premium_codes": premium_codes,
            "instructions": instructions or "Use these codes to access your premium content.",
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject=f"Your Premium Codes - Order #{order_id}",
            template_name="premium_code.html",
            template_data=template_data
        )
    
    @staticmethod
    async def send_welcome_email(
        recipient_email: str,
        customer_name: str
    ) -> bool:
        """
        Send welcome email to new customers
        """
        template_data = {
            "customer_name": customer_name,
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject="Welcome to Chemouflage Card Shop!",
            template_name="welcome.html",
            template_data=template_data
        )
    
    @staticmethod
    async def send_order_cancellation(
        recipient_email: str,
        customer_name: str,
        order_id: str,
        refund_amount: Optional[float] = None,
        cancellation_reason: Optional[str] = None,
        additional_message: Optional[str] = None
    ) -> bool:
        """
        Send order cancellation email
        """
        template_data = {
            "customer_name": customer_name,
            "order_id": order_id,
            "refund_amount": refund_amount,
            "cancellation_reason": cancellation_reason,
            "additional_message": additional_message,
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject=f"Order Cancelled #{order_id}",
            template_name="order_cancellation.html",
            template_data=template_data
        )
    
    @staticmethod
    async def send_shipping_notification(
        recipient_email: str,
        customer_name: str,
        order_id: str,
        tracking_number: Optional[str] = None,
        carrier_name: Optional[str] = None,
        carrier_url: Optional[str] = None,
        shipping_method: Optional[str] = None,
        estimated_delivery: Optional[str] = None,
        shipping_address: Optional[str] = None,
        tracking_url: Optional[str] = None,
        additional_message: Optional[str] = None
    ) -> bool:
        """
        Send shipping notification email
        """
        template_data = {
            "customer_name": customer_name,
            "order_id": order_id,
            "tracking_number": tracking_number,
            "carrier_name": carrier_name,
            "carrier_url": carrier_url,
            "shipping_method": shipping_method,
            "estimated_delivery": estimated_delivery,
            "shipping_address": shipping_address,
            "tracking_url": tracking_url or f"{settings.FRONTEND_URL}/track/{order_id}",
            "additional_message": additional_message,
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject=f"Your Order Has Shipped #{order_id}",
            template_name="shipping_notification.html",
            template_data=template_data
        )
    
    @staticmethod
    async def send_password_reset(
        recipient_email: str,
        customer_name: str,
        reset_link: str,
        expiry_hours: int = 24,
        expiry_date: Optional[str] = None
    ) -> bool:
        """
        Send password reset email
        """
        template_data = {
            "customer_name": customer_name,
            "reset_link": reset_link,
            "expiry_hours": expiry_hours,
            "expiry_date": expiry_date,
            "company_name": "Chemouflage Card Shop",
            "support_email": settings.MAIL_FROM,
            "frontend_url": settings.FRONTEND_URL
        }
        
        return await EmailService.send_email(
            recipients=[recipient_email],
            subject="Reset Your Password - Chemouflage Card Shop",
            template_name="password_reset.html",
            template_data=template_data
        )


# Simple function for plain text emails (used by contact form)
async def send_email(to_email: str, subject: str, content: str) -> bool:
    """
    Send a simple plain text email
    """
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=content,
            subtype=MessageType.plain
        )
        
        await fastmail.send_message(message)
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
