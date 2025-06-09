from typing import List

from app.api.dependencies import get_current_admin, get_current_user
from app.core.config import settings
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.product import (PremiumCode, PremiumCodeBind,
                                PremiumCodeCreate, PremiumCodeGenerate,
                                PremiumCodeUpdate)
from app.models.user import User
from app.repositories.premium_code import PremiumCodeRepository
from app.repositories.user import UserRepository
from app.services.email import EmailService
from app.utils.pagination import create_paginated_response
from fastapi import (APIRouter, BackgroundTasks, Depends, HTTPException, Query,
                     status)

router = APIRouter()


@router.post("/", response_model=dict)
async def create_premium_code(
    premium_code: PremiumCodeCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a single premium code."""
    try:
        code_id = await PremiumCodeRepository.create(premium_code)
        created_code = await PremiumCodeRepository.get_by_id(code_id)
        return {"message": "Premium code created successfully", "code": created_code}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create premium code: {str(e)}"
        )


@router.post("/generate", response_model=dict)
async def generate_premium_codes(
    generate_request: PremiumCodeGenerate,
    current_user: User = Depends(get_current_admin)
):
    """Generate multiple premium codes."""
    try:
        if generate_request.count > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot generate more than 100 codes at once"
            )
        
        code_ids = await PremiumCodeRepository.generate_bulk(generate_request)
        codes = []
        for code_id in code_ids:
            code = await PremiumCodeRepository.get_by_id(code_id)
            if code:
                codes.append(code)
        
        return {
            "message": f"Generated {len(codes)} premium codes successfully",
            "codes": codes
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate premium codes: {str(e)}"
        )


@router.get("/", response_model=PaginatedResponse[PremiumCode])
async def get_premium_codes(
    pagination: PaginationParams = Depends(),
    active_only: bool = Query(False, description="Filter only active codes"),
    bound_only: bool = Query(False, description="Filter only bound codes"),
    current_user: User = Depends(get_current_admin)
):
    """Get all premium codes with pagination and optional filtering."""
    try:
        codes = await PremiumCodeRepository.get_all(
            skip=pagination.skip, 
            limit=pagination.limit, 
            active_only=active_only, 
            bound_only=bound_only
        )
        total_count = await PremiumCodeRepository.count(
            active_only=active_only, 
            bound_only=bound_only
        )
        
        return await create_paginated_response(
            data=codes,
            page=pagination.page,
            limit=pagination.limit,
            total_count=total_count
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch premium codes: {str(e)}"
        )


@router.get("/stats", response_model=dict)
async def get_premium_code_stats(
    current_user: User = Depends(get_current_admin)
):
    """Get premium code statistics."""
    try:
        total_codes = await PremiumCodeRepository.count()
        active_codes = await PremiumCodeRepository.count_active()
        bound_codes = await PremiumCodeRepository.count_bound()
        
        return {
            "total_codes": total_codes,
            "active_codes": active_codes,
            "bound_codes": bound_codes,
            "unbound_codes": total_codes - bound_codes
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch premium code stats: {str(e)}"
        )


@router.get("/my-codes", response_model=List[PremiumCode])
async def get_my_premium_codes(
    current_user: User = Depends(get_current_user)
):
    """Get premium codes bound to the current user."""
    try:
        codes = await PremiumCodeRepository.get_by_user(current_user.id)
        return codes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user premium codes: {str(e)}"
        )


@router.get("/{code_id}", response_model=PremiumCode)
async def get_premium_code(
    code_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Get a premium code by ID."""
    try:
        code = await PremiumCodeRepository.get_by_id(code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Premium code not found"
            )
        return code
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch premium code: {str(e)}"
        )


@router.post("/{code_id}/bind", response_model=PremiumCode)
async def bind_premium_code(
    code_id: str,
    bind_request: PremiumCodeBind,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_admin)
):
    """Bind a premium code to a user."""
    try:
        code = await PremiumCodeRepository.get_by_id(code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Premium code not found"
            )
        
        if code.bound_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Premium code is already bound to a user"
            )
        
        # Get user details for email notification
        user = await UserRepository.get_by_email(bind_request.user_email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {bind_request.user_email} not found"
            )
        
        updated_code = await PremiumCodeRepository.bind_to_user(code_id, bind_request)
        if not updated_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to bind premium code"
            )
        
        # Send premium code email notification in background
        if user.email:
            premium_codes = [{
                "code": updated_code.code,
                "product_name": updated_code.description or "Premium Access",
                "instructions": "This premium code has been assigned to your account. Use it to access your exclusive content."
            }]
            
            background_tasks.add_task(
                EmailService.send_premium_code,
                recipient_email=user.email,
                customer_name=user.full_name or user.email,
                order_id="MANUAL-BIND",  # Special identifier for manual binds
                premium_codes=premium_codes,
                instructions="Your premium code has been manually assigned to your account by an administrator."
            )
        
        return updated_code
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bind premium code: {str(e)}"
        )


@router.post("/{code_id}/unbind", response_model=PremiumCode)
async def unbind_premium_code(
    code_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Unbind a premium code from a user."""
    try:
        code = await PremiumCodeRepository.get_by_id(code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Premium code not found"
            )
        
        if not code.bound_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Premium code is not bound to any user"
            )
        
        updated_code = await PremiumCodeRepository.unbind_from_user(code_id)
        if not updated_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to unbind premium code"
            )
        
        return updated_code
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unbind premium code: {str(e)}"
        )


@router.put("/{code_id}", response_model=PremiumCode)
async def update_premium_code(
    code_id: str,
    code_update: PremiumCodeUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update a premium code."""
    try:
        code = await PremiumCodeRepository.get_by_id(code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Premium code not found"
            )
        
        updated_code = await PremiumCodeRepository.update(code_id, code_update)
        if not updated_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update premium code"
            )
        
        return updated_code
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update premium code: {str(e)}"
        )


@router.delete("/{code_id}", response_model=dict)
async def delete_premium_code(
    code_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a premium code."""
    try:
        code = await PremiumCodeRepository.get_by_id(code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Premium code not found"
            )
        
        success = await PremiumCodeRepository.delete(code_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete premium code"
            )
        
        return {"message": "Premium code deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete premium code: {str(e)}"
        )


@router.post("/use/{code}", response_model=dict)
async def use_premium_code(
    code: str,
    current_user: User = Depends(get_current_user)
):
    """Use a premium code."""
    try:
        success = await PremiumCodeRepository.use_code(code, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid code, expired, or already used"
            )
        
        return {"message": "Premium code used successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to use premium code: {str(e)}"
        )


@router.get("/validate/{code}", response_model=dict)
async def validate_premium_code(
    code: str,
    current_user: User = Depends(get_current_user)
):
    """Validate a premium code without using it."""
    try:
        premium_code = await PremiumCodeRepository.get_by_code(code)
        if not premium_code:
            return {"valid": False, "reason": "Code not found"}
        
        if not premium_code.is_active:
            return {"valid": False, "reason": "Code is inactive"}
        
        if premium_code.expires_at and premium_code.expires_at < premium_code.created_at:
            return {"valid": False, "reason": "Code has expired"}
        
        if premium_code.usage_limit and premium_code.used_count >= premium_code.usage_limit:
            return {"valid": False, "reason": "Code usage limit reached"}
        
        if premium_code.bound_user_id and premium_code.bound_user_id != current_user.id:
            return {"valid": False, "reason": "Code is bound to another user"}
        
        return {"valid": True, "code": premium_code}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate premium code: {str(e)}"
        )