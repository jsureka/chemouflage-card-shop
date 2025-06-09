"""
Pagination utilities for creating paginated responses.
"""
from typing import List, TypeVar

from app.models.pagination import PaginatedResponse, PaginationMetadata

T = TypeVar('T')


async def create_paginated_response(
    data: List[T],
    page: int,
    limit: int,
    total_count: int
) -> PaginatedResponse[T]:
    """
    Create a paginated response from data, pagination parameters, and total count.
    
    Args:
        data: The list of items for the current page
        page: Current page number (1-based)
        limit: Number of items per page
        total_count: Total number of items available
    
    Returns:
        PaginatedResponse with data and pagination metadata
    """
    total_pages = (total_count + limit - 1) // limit if total_count > 0 else 0
    
    metadata = PaginationMetadata(
        current_page=page,
        page_size=limit,
        total_items=total_count,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )
    
    return PaginatedResponse(data=data, pagination=metadata)
