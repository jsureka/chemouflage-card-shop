# Creating a New CRUD API Endpoint

This guide explains how to add a new CRUD (Create, Read, Update, Delete) API for a new resource in the Chemouflage backend, following best practices for caching, admin checks, security, pagination, and validation.

---

## 1. Define Your Pydantic Models

Create your models in `app/models/your_resource.py`:

```python
# filepath: backend/app/models/your_resource.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class YourResourceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class YourResourceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None

class YourResource(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
```

---

## 2. Create the Repository

Implement database logic in `app/repositories/your_resource.py`:

```python
# filepath: backend/app/repositories/your_resource.py
from datetime import datetime
from typing import Optional, List
from app.models.your_resource import YourResource, YourResourceCreate, YourResourceUpdate
from app.db.mongodb import get_database
from app.utils.cache import cache_invalidate, cache_service

class YourResourceRepository:
    @staticmethod
    @cache_invalidate("your_resource:*")  # Invalidate cache on create
    async def create(resource: YourResourceCreate) -> str:
        db = await get_database()
        doc = resource.model_dump()
        doc["created_at"] = datetime.utcnow()
        result = await db.your_resources.insert_one(doc)
        return str(result.inserted_id)

    @staticmethod
    async def get_by_id(resource_id: str) -> Optional[YourResource]:
        # Try cache first
        cached = await cache_service.get_resource(resource_id)
        if cached:
            return YourResource(**cached)
        db = await get_database()
        doc = await db.your_resources.find_one({"_id": ObjectId(resource_id)})
        if doc:
            resource = YourResource(**doc, id=str(doc["_id"]))
            await cache_service.set_resource(resource_id, resource.model_dump())
            return resource
        return None

    # Implement update, delete, list, etc., with similar patterns
```

---

## 3. Add API Endpoints

Create your endpoints in `app/api/v1/endpoints/your_resource.py`:

```python
# filepath: backend/app/api/v1/endpoints/your_resource.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.models.your_resource import YourResource, YourResourceCreate, YourResourceUpdate
from app.repositories.your_resource import YourResourceRepository
from app.api.dependencies import get_current_admin, get_current_user
from app.models.pagination import PaginatedResponse, PaginationParams
from app.utils.pagination import create_paginated_response

router = APIRouter()

@router.post("/", response_model=YourResource, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource_in: YourResourceCreate,
    current_user = Depends(get_current_admin)  # Admin check
):
    resource_id = await YourResourceRepository.create(resource_in)
    return await YourResourceRepository.get_by_id(resource_id)

@router.get("/{resource_id}", response_model=YourResource)
async def get_resource(resource_id: str, current_user = Depends(get_current_user)):
    resource = await YourResourceRepository.get_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource

@router.get("/", response_model=PaginatedResponse[YourResource])
async def list_resources(
    pagination: PaginationParams = Depends(),
    search: Optional[str] = Query(None),
    current_user = Depends(get_current_user)
):
    # Implement pagination and optional search
    # Use create_paginated_response for consistent pagination
    ...

@router.put("/{resource_id}", response_model=YourResource)
async def update_resource(
    resource_id: str,
    resource_update: YourResourceUpdate,
    current_user = Depends(get_current_admin)
):
    # Update logic with admin check
    ...

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: str,
    current_user = Depends(get_current_admin)
):
    # Delete logic with admin check
    ...
```

---

## 4. Register the Router

Add your router to `app/api/v1/api.py`:

```python
# filepath: backend/app/api/v1/api.py
from app.api.v1.endpoints import your_resource

api_router.include_router(your_resource.router, prefix="/your-resource", tags=["your-resource"])
```

---

## 5. Caching

- Use `@cache_invalidate` decorators on create, update, and delete methods.
- Use `cache_service` to cache frequently accessed resources.
- Cache keys should be unique per resource (e.g., `your_resource:{id}`).

---

## 6. Admin Checking & Security

- Use `Depends(get_current_admin)` for endpoints that require admin privileges.
- Use `Depends(get_current_user)` for endpoints accessible to all authenticated users.
- Validate all input using Pydantic models.
- Never expose sensitive fields in API responses.

---

## 7. Pagination

- Use `PaginationParams` and `PaginatedResponse` for list endpoints.
- Use `create_paginated_response` utility for consistent pagination structure.

---

## 8. Validation

- Use Pydantic field constraints (e.g., `min_length`, `max_length`, `regex`).
- Validate business logic in repository or endpoint as needed.
- Return appropriate HTTP status codes and error messages.

---

## 9. Testing

- Add unit and integration tests for your endpoints and repository logic.
- Test for permission errors, validation errors, and edge cases.

---

## 10. Example Request/Response

**Create:**

```http
POST /api/v1/your-resource/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Example",
  "description": "Sample resource"
}
```

**Paginated List:**

```http
GET /api/v1/your-resource/?page=1&limit=20
Authorization: Bearer <user_token>
```

## 11. Additional Notes

- Always check for existing resources before creating duplicates.
- Log important actions for audit purposes.
- Use background tasks for heavy operations (e.g., sending emails).

---

For more details, see:

- [backend/app/models/](backend/app/models/)
- [backend/app/repositories/](backend/app/repositories/)
- [backend/app/api/v1/endpoints/](backend/app/api/v1/endpoints/)
- [backend/app/utils/pagination.py](backend/app/utils/pagination.py)
- [backend/app/utils/cache.py](backend/app/utils/cache.py)
