import hashlib
from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.product import Product, ProductCreate, ProductInDB, ProductUpdate
from app.models.user import PyObjectId
from app.services.cache import cache_invalidate, cache_service, cached


class ProductRepository:
    @staticmethod
    @cache_invalidate("products:*")  # Invalidate all product list caches
    async def create(product: ProductCreate) -> str:
        db = await get_database()
        product_dict = product.model_dump()
        product_dict["created_at"] = datetime.utcnow()
        result = await db.products.insert_one(product_dict)
        return str(result.inserted_id)
    
    @staticmethod
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
    async def update(product_id: str, product_update: ProductUpdate) -> Optional[Product]:
        db = await get_database()
        update_data = {k: v for k, v in product_update.model_dump(exclude_unset=True).items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        if update_data:
            await db.products.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
        
        # Invalidate caches
        await cache_service.invalidate_product(product_id)
        await cache_service.invalidate_all_products()  # Invalidate list caches
        
        return await ProductRepository.get_by_id(product_id)
    
    @staticmethod
    async def delete(product_id: str) -> bool:
        db = await get_database()
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        
        if result.deleted_count > 0:
            # Invalidate caches
            await cache_service.invalidate_product(product_id)
            await cache_service.invalidate_all_products()  # Invalidate list caches
            return True
        return False    @staticmethod
    @cached("product_count_{active_only}", ttl=300)  # Cache for 5 minutes
    async def count(active_only: bool = False) -> int:
        db = await get_database()
        query = {"is_active": True} if active_only else {}
        return await db.products.count_documents(query)
    
    @staticmethod
    @cached("product_search_{query}", ttl=300)  # Cache search results for 5 minutes
    async def search(query: str) -> List[Product]:
        db = await get_database()
        cursor = db.products.find({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"category": {"$regex": query, "$options": "i"}}
            ]
        })
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
        return products
    
    @staticmethod
    @cached("product_category_{category}", ttl=600)  # Cache category results for 10 minutes
    async def find_by_category(category: str) -> List[Product]:
        db = await get_database()
        cursor = db.products.find({"category": category})
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
        return products
