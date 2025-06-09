from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar('T')

class PaginationMetadata(BaseModel):
    """Metadata for paginated responses."""
    
    current_page: int = Field(..., ge=1, description="Current page number (1-based)")
    page_size: int = Field(..., ge=1, le=1000, description="Number of items per page")
    total_items: int = Field(..., ge=0, description="Total number of items")
    total_pages: int = Field(..., ge=0, description="Total number of pages")
    has_next: bool = Field(..., description="Whether there's a next page")
    has_previous: bool = Field(..., description="Whether there's a previous page")
    
    @classmethod
    def create(
        cls,
        current_page: int,
        page_size: int,
        total_items: int
    ) -> "PaginationMetadata":
        """Create pagination metadata from current page, size, and total items."""
        total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0
        
        return cls(
            current_page=current_page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=current_page < total_pages if total_pages > 0 else False,
            has_previous=current_page > 1
        )

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    
    data: List[T] = Field(..., description="List of items for current page")
    pagination: PaginationMetadata = Field(..., description="Pagination metadata")
    
    @classmethod
    def create(
        cls,
        items: List[T],
        current_page: int,
        page_size: int,
        total_items: int
    ) -> "PaginatedResponse[T]":
        """Create a paginated response from items and pagination info."""
        pagination = PaginationMetadata.create(
            current_page=current_page,
            page_size=page_size,
            total_items=total_items
        )
        
        return cls(data=items, pagination=pagination)

class PaginationParams(BaseModel):
    """Common pagination parameters for API endpoints."""
    
    page: int = Field(1, ge=1, description="Page number (1-based)")
    limit: int = Field(20, ge=1, le=1000, description="Number of items per page")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for database queries."""
        return (self.page - 1) * self.limit
