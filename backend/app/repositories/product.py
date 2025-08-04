import hashlib
from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.product import Product, ProductCreate, ProductInDB, ProductUpdate
from app.models.user import PyObjectId
from app.services.cache import cache_invalidate, cache_service, cached
from app.utils.timing import profile_operation


class ProductRepository:
    @staticmethod
    @cache_invalidate("products:*")  # Invalidate all product list caches
    @profile_operation("db_create_product")
    async def create(product: ProductCreate) -> str:
        db = await get_database()
        product_dict = product.model_dump()
        product_dict["created_at"] = datetime.utcnow()
        result = await db.products.insert_one(product_dict)
        
        # Also invalidate count caches
        await cache_service.delete_patterns("count_*")
        
        return str(result.inserted_id)
    
    @staticmethod
    @profile_operation("db_get_product_by_id")
    async def get_by_id(product_id: str) -> Optional[Product]:
        # Try to get from cache first
        cached_product = await cache_service.get_product(product_id)
        if cached_product:
            return Product(**cached_product)
        
        # Get from database
        db = await get_database()
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if product:
            product_obj = Product(**product, id=str(product["_id"]))
            
            # Cache the product
            await cache_service.set_product(product_id, product_obj.model_dump())
            
            return product_obj
        return None
    
    @staticmethod
    @profile_operation("db_get_all_products")
    async def get_all(skip: int = 0, limit: int = 100, active_only: bool = False) -> List[Product]:
        # Create cache key based on parameters
        cache_key = f"all_{skip}_{limit}_{active_only}"
        
        # Try to get from cache first
        cached_products = await cache_service.get_products_list(cache_key)
        if cached_products:
            return [Product(**p) for p in cached_products]
        
        # Get from database
        db = await get_database()
        query = {"is_active": True} if active_only else {}
        cursor = db.products.find(query).skip(skip).limit(limit).sort("created_at", -1)
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
          # Cache the results
        if products:
            await cache_service.set_products_list(
                cache_key, 
                [p.model_dump() for p in products]
            )
        
        return products
    
    @staticmethod
    @profile_operation("db_update_product")
    async def update(product_id: str, product_update: ProductUpdate) -> Optional[Product]:
        db = await get_database()
        update_data = {k: v for k, v in product_update.model_dump(exclude_unset=True).items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        if update_data:
            await db.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        
        # Invalidate caches - more targeted invalidation
        await cache_service.invalidate_product(product_id)
        # Invalidate all list caches (including search and category)
        await cache_service.delete_patterns("products:*", "count_*")
        
        return await ProductRepository.get_by_id(product_id)
    
    @staticmethod
    @profile_operation("db_delete_product")
    async def delete(product_id: str) -> bool:
        db = await get_database()
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count > 0:
            # Invalidate caches - more targeted invalidation
            await cache_service.invalidate_product(product_id)
            # Invalidate all list caches (including search and category)
            await cache_service.delete_patterns("products:*", "count_*")
            return True
        return False

    @staticmethod
    @cached("product_count_{active_only}", ttl=300)  # Cache for 5 minutes
    @profile_operation("db_count_products")
    async def count(active_only: bool = False) -> int:
        db = await get_database()
        query = {"is_active": True} if active_only else {}
        return await db.products.count_documents(query)
    
    @staticmethod
    @profile_operation("db_search_products")
    async def search(
        query: str, 
        skip: int = 0, 
        limit: int = 100, 
        active_only: bool = False
    ) -> List[Product]:
        """Search products with pagination support."""
        cache_key = f"search_{hashlib.md5(query.encode()).hexdigest()}_{skip}_{limit}_{active_only}"
        
        # Try cache first
        cached_products = await cache_service.get_products_list(cache_key)
        if cached_products:
            return [Product(**p) for p in cached_products]
        
        db = await get_database()
        search_filter = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if active_only:
            search_filter["is_active"] = True
            
        cursor = db.products.find(search_filter).skip(skip).limit(limit).sort("created_at", -1)
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
        
        # Cache search results for 5 minutes  
        if products:
            await cache_service.set_products_list(
                cache_key, 
                [p.model_dump() for p in products]
            )
        
        return products
    
    @staticmethod 
    @profile_operation("db_count_search_products")
    async def count_search(query: str, active_only: bool = False) -> int:
        """Count search results."""
        cache_key = f"count_search_{hashlib.md5(query.encode()).hexdigest()}_{active_only}"
        
        # Try cache first
        cached_count = await cache_service.get(cache_key)
        if cached_count is not None:
            return cached_count
        
        db = await get_database()
        search_filter = {
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]
        }
        
        if active_only:
            search_filter["is_active"] = True
            
        count = await db.products.count_documents(search_filter)
        
        # Cache for 5 minutes
        await cache_service.set(cache_key, count, ttl=300)
        
        return count
    
    @staticmethod
    @profile_operation("db_get_products_by_category")
    async def get_by_category(
        category: str, 
        skip: int = 0, 
        limit: int = 100, 
        active_only: bool = False
    ) -> List[Product]:
        """Get products by category with proper pagination support."""
        cache_key = f"category_{category}_{skip}_{limit}_{active_only}"
        
        # Try to get from cache first
        cached_products = await cache_service.get_products_list(cache_key)
        if cached_products:
            return [Product(**p) for p in cached_products]
        
        # Get from database using compound index (category, is_active)
        db = await get_database()
        query = {"category": category}
        if active_only:
            query["is_active"] = True
            
        cursor = db.products.find(query).skip(skip).limit(limit).sort("created_at", -1)
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
        
        # Cache the results
        if products:
            await cache_service.set_products_list(
                cache_key, 
                [p.model_dump() for p in products]
            )
        
        return products
    
    @staticmethod
    @profile_operation("db_count_products_by_category")
    async def count_by_category(category: str, active_only: bool = False) -> int:
        """Count products by category."""
        cache_key = f"count_category_{category}_{active_only}"
        
        # Try cache first
        cached_count = await cache_service.get(cache_key)
        if cached_count is not None:
            return cached_count
        
        db = await get_database()
        query = {"category": category}
        if active_only:
            query["is_active"] = True
            
        count = await db.products.count_documents(query)
        
        # Cache for 5 minutes
        await cache_service.set(cache_key, count, ttl=300)
        
        return count
