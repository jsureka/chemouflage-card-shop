from typing import List, Optional

from app.api.dependencies import get_current_admin, get_current_user
from app.models.contact import ContactMessageCreate, ContactMessageResponse
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.user import User
from app.repositories.contact import contact_repository
from app.services.email import send_email
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter()


@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def send_contact_message(message_data: ContactMessageCreate):
    """Send a contact message"""
    try:        # Create the message in database
        message_id = await contact_repository.create_message(message_data)

        # Send email notification to admin (optional)
        try:
            email_subject = f"New Contact Message: {message_data.subject}"
            email_content = f"""
            New contact message received:
            
            From: {message_data.name} ({message_data.email})
            Subject: {message_data.subject}
            
            Message:
            {message_data.message}
            
            ---
            Message ID: {message_id}
            """
            
            # Send to admin email (you can configure this)
            await send_email(
                to_email="admin@chemouflage.com",
                subject=email_subject,
                content=email_content
            )
        except Exception as e:
            # Email sending failure shouldn't break the contact form
            print(f"Failed to send admin notification email: {e}")
        
        # Send confirmation email to user
        try:
            confirmation_subject = "Thank you for contacting Chemouflage"
            confirmation_content = f"""
            Dear {message_data.name},
            
            Thank you for contacting Chemouflage! We have received your message about "{message_data.subject}".
            
            Our team will review your message and get back to you within 24 hours.
            
            Best regards,
            The Chemouflage Team
            
            ---
            Your message:
            {message_data.message}
            """
            
            await send_email(
                to_email=message_data.email,
                subject=confirmation_subject,
                content=confirmation_content
            )
        except Exception as e:
            # Email sending failure shouldn't break the contact form
            print(f"Failed to send confirmation email: {e}")
        
        return {
            "message": "Your message has been sent successfully. We'll get back to you within 24 hours.",
            "message_id": message_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message. Please try again later."
        )


@router.get("/contact/messages", response_model=PaginatedResponse[ContactMessageResponse])
async def get_contact_messages(
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
    admin_user: User = Depends(get_current_admin)
):
    """Get all contact messages (Admin only)"""
    pagination = PaginationParams(page=page, limit=limit)
    result = await contact_repository.get_all_messages(pagination, status_filter)

    # Convert to response model
    response_data = []
    for message in result.data:
        response_data.append(ContactMessageResponse(
            id=message.id if hasattr(message, 'id') else str(message.created_at),
            name=message.name,
            email=message.email,
            subject=message.subject,
            message=message.message,
            created_at=message.created_at,
            status=message.status,
            admin_notes=message.admin_notes
        ))
        
    return PaginatedResponse.create(
    items=response_data,
    current_page=pagination.page,
    page_size=pagination.limit,
    total_items=result.total
)


@router.put("/contact/messages/{message_id}/status")
async def update_message_status(
    message_id: str,
    status: str,
    admin_notes: Optional[str] = None,
    admin_user: User = Depends(get_current_admin)
):
    """Update contact message status (Admin only)"""
    if status not in ["new", "read", "replied"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'new', 'read', or 'replied'"
        )

    success = await contact_repository.update_message_status(message_id, status, admin_notes)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return {"message": "Message status updated successfully"}


@router.delete("/contact/messages/{message_id}")
async def delete_contact_message(
    message_id: str,
    admin_user: User = Depends(get_current_admin)
):
    """Delete a contact message (Admin only)"""
    success = await contact_repository.delete_message(message_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return {"message": "Message deleted successfully"}
