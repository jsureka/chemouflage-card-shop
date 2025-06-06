from datetime import datetime
from typing import List, Optional

from app.db.mongodb import get_database
from app.models.product import (Product, ProductCreate, ProductInDB,
                                ProductUpdate)
from app.models.user import PyObjectId
from bson import ObjectId


class ProductRepository:
    @staticmethod
    async def create(product: ProductCreate) -> str:
        db = await get_database()
        product_dict = product.model_dump()
        product_dict["created_at"] = datetime.utcnow()
        result = await db.products.insert_one(product_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_by_id(product_id: str) -> Optional[Product]:
        db = await get_database()
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if product:
            return Product(**product, id=str(product["_id"]))
        return None
    
    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100, active_only: bool = False) -> List[Product]:
        db = await get_database()
        query = {"is_active": True} if active_only else {}
        cursor = db.products.find(query).skip(skip).limit(limit).sort("created_at", -1)
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
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
        
        return await ProductRepository.get_by_id(product_id)
    
    @staticmethod
    async def delete(product_id: str) -> bool:
        db = await get_database()
        result = await db.products.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0
    
    @staticmethod
    async def count() -> int:
        db = await get_database()
        return await db.products.count_documents({})
    
    @staticmethod
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
    async def find_by_category(category: str) -> List[Product]:
        db = await get_database()
        cursor = db.products.find({"category": category})
        products = []
        async for doc in cursor:
            products.append(Product(**doc, id=str(doc["_id"])))
        return products
