from typing import Any, List, Optional

from app.api.dependencies import get_current_admin, get_current_user
from app.models.product import Product, ProductCreate, ProductUpdate
from app.models.user import User
from app.repositories.product import ProductRepository
from fastapi import APIRouter, Depends, HTTPException, Query, status

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

@router.get("/", response_model=List[Product])
async def read_products(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = Query(False, description="Filter only active products"),
    category: Optional[str] = Query(None, description="Filter by category")
) -> Any:
    """
    Retrieve products, with optional filtering.
    """
    if category:
        products = await ProductRepository.find_by_category(category)
    else:
        products = await ProductRepository.get_all(skip=skip, limit=limit, active_only=active_only)
    return products

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
