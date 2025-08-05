# Products API Performance Optimizations

## Overview

The Products API endpoints have been optimized for better performance, pagination, and caching. This document outlines the improvements and any breaking changes.

## Performance Optimizations Implemented

### 1. **Pagination Everywhere**
- All product listing endpoints now support proper pagination
- Default page size: 20 items
- Maximum page size: 1000 items
- All endpoints return `PaginatedResponse<Product>` format

### 2. **Database Query Optimization**
- Leverages existing MongoDB compound indexes:
  - `(category, is_active)` for category filtering
  - `(is_active, created_at)` for active product sorting
  - Text search index for search functionality
- Efficient query patterns minimize database load

### 3. **Enhanced Caching**
- Product lists cached for 10 minutes
- Search results and counts cached for 5 minutes
- Targeted cache invalidation (only affected caches cleared)
- Cache keys include pagination parameters for accuracy

### 4. **Performance Monitoring**
- All database operations have timing decorators
- Operations >100ms logged as slow operations
- Comprehensive profiling for performance optimization

## API Changes

### Breaking Changes

#### 1. Search Endpoint Response Format
**Before:**
```
GET /api/v1/products/search/{query}
Response: Product[]
```

**After:**
```
GET /api/v1/products/search/{query}?page=1&limit=20&active_only=false
Response: PaginatedResponse<Product>
```

#### 2. Category Filtering Behavior
**Before:** Category filtering returned ALL products in category (no pagination)

**After:** Category filtering uses proper pagination like other endpoints

### New Query Parameters

All product endpoints now support these optional parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 20 | Items per page (max 1000) |
| `active_only` | boolean | false | Filter only active products |
| `category` | string | null | Filter by category |

### Updated Response Format

All listing endpoints now return:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
```

## Endpoint Details

### 1. List Products
```
GET /api/v1/products/
```
- Supports pagination, category filtering, and active-only filtering
- Uses compound indexes for optimal performance
- Response cached for 10 minutes

### 2. Search Products
```
GET /api/v1/products/search/{query}
```
- **BREAKING CHANGE:** Now returns `PaginatedResponse<Product>`
- Supports all pagination parameters
- Search results cached for 5 minutes
- Uses text search index for efficient searching

### 3. Get Product by ID
```
GET /api/v1/products/{product_id}
```
- Individual product caching (10 minutes)
- Performance monitoring added

## Performance Benefits

1. **Reduced Memory Usage:** Pagination prevents loading large datasets
2. **Faster Response Times:** Efficient database queries with proper indexing
3. **Better Caching:** Targeted cache invalidation and appropriate TTLs
4. **Monitoring:** Slow operation detection for continuous optimization
5. **Scalability:** Consistent performance as product catalog grows

## Migration Guide

### For Frontend Developers

1. **Update Search API Calls:**
   ```javascript
   // Before
   const products = await api.get(`/products/search/${query}`);
   
   // After
   const response = await api.get(`/products/search/${query}?page=1&limit=20`);
   const products = response.data;
   const pagination = response.pagination;
   ```

2. **Handle Pagination in Category Filtering:**
   ```javascript
   // Before - got all products at once
   const products = await api.get(`/products?category=${category}`);
   
   // After - paginated results
   const response = await api.get(`/products?category=${category}&page=1&limit=20`);
   ```

3. **Use New Pagination Metadata:**
   ```javascript
   const response = await api.get('/products');
   const { data: products, pagination } = response;
   
   // pagination.total_pages, pagination.has_next, etc.
   ```

### For API Consumers

- All endpoints maintain backward compatibility for basic parameters
- New pagination parameters are optional (sensible defaults provided)
- Response format change only affects search endpoint

## Cache Configuration

| Cache Type | TTL | Invalidation |
|------------|-----|--------------|
| Individual Products | 10 minutes | On product update/delete |
| Product Lists | 10 minutes | On product create/update/delete |
| Search Results | 5 minutes | On product changes |
| Count Queries | 5 minutes | On product changes |

## Monitoring

Monitor these metrics for performance insights:

- `SLOW_OPERATION` log entries for database operations >100ms
- Cache hit/miss ratios
- Average response times for pagination queries
- Database query patterns and index usage

## Database Indexes Used

These existing indexes are leveraged for optimal performance:

```javascript
// Products collection indexes
{
  "category": 1,
  "is_active": 1
}
{
  "is_active": 1,
  "created_at": -1
}
{
  "name": "text",
  "description": "text", 
  "category": "text"
}
```

## Best Practices

1. **Always use pagination** for listing endpoints
2. **Set reasonable page sizes** (20-50 items typically optimal)
3. **Use active_only=true** in production for public endpoints
4. **Monitor slow operations** in logs for optimization opportunities
5. **Cache responses** on frontend when appropriate