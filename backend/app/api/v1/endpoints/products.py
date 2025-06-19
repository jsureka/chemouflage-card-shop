from typing import Any, List, Optional
import uuid

from app.api.dependencies import get_current_admin
from app.config.cloudinary import CloudinaryService
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.product import Product, ProductCreate, ProductUpdate
from app.models.user import User
from app.repositories.product import ProductRepository
from app.utils.pagination import create_paginated_response
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File

router = APIRouter()

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Create a new product. Only for admins.
    """
    product_id = await ProductRepository.create(product_in)
    return await ProductRepository.get_by_id(product_id)

@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin)
) -> dict:
    """
    Upload a product image to Cloudinary. Only for admins.
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Validate file size (5MB limit)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Upload to Cloudinary
        image_url = await CloudinaryService.upload_image(
            file_content=file_content,
            filename=unique_filename,
            folder="products"
        )
        
        return {
            "message": "Image uploaded successfully",
            "image_url": image_url,
            "filename": unique_filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

@router.get("/", response_model=PaginatedResponse[Product])
async def read_products(
    pagination: PaginationParams = Depends(),
    active_only: bool = Query(False, description="Filter only active products"),
    category: Optional[str] = Query(None, description="Filter by category")
) -> Any:
    """
    Retrieve products with pagination, with optional filtering.
    """    
    if category:
        # For category filtering, we need to implement pagination differently
        # For now, we'll return all products by category (not paginated)
        products = await ProductRepository.find_by_category(category)
        # Create a simple paginated response for category filtering
        return await create_paginated_response(
            data=products,
            page=1,
            limit=len(products) if products else 0,
            total_count=len(products) if products else 0
        )
    else:
        products = await ProductRepository.get_all(skip=pagination.skip, limit=pagination.limit, active_only=active_only)
        total_count = await ProductRepository.count(active_only=active_only)
        
        return await create_paginated_response(
            data=products,
            page=pagination.page,
            limit=pagination.limit,
            total_count=total_count
        )

@router.get("/{product_id}", response_model=Product)
async def read_product(
    product_id: str
) -> Any:
    """
    Get a specific product by ID.
    """
    product = await ProductRepository.get_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_admin)
) -> Any:
    """
    Update a product. Only for admins.
    """
    product = await ProductRepository.get_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    updated_product = await ProductRepository.update(product_id, product_in)
    return updated_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: User = Depends(get_current_admin)
):
    """
    Delete a product. Only for admins.
    """
    product = await ProductRepository.get_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    success = await ProductRepository.delete(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )

@router.get("/search/{query}", response_model=List[Product])
async def search_products(
    query: str
) -> Any:
    """
    Search products by name, description or category.
    """
    products = await ProductRepository.search(query)
    return products
