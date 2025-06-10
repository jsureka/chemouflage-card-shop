from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from app.db.mongodb import get_database
from app.models.product import (AdminOrderUpdate, Order, OrderCreate,
                                OrderInDB, OrderItem, OrderItemCreate,
                                OrderItemInDB, OrderItemResponse,
                                OrderItemUpdate, OrderUpdate, OrderWithItems)
from app.repositories.premium_code import PremiumCodeRepository
from bson import ObjectId


class OrderRepository:
    @staticmethod
    async def create(order: OrderCreate) -> str:
        db = await get_database()
        order_dict = order.model_dump()
        order_dict["user_id"] = ObjectId(order_dict["user_id"])
        order_dict["created_at"] = datetime.utcnow()
        
        result = await db.orders.insert_one(order_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_by_id(order_id: str) -> Optional[Order]:
        db = await get_database()
        try:
            order = await db.orders.find_one({"_id": ObjectId(order_id)})
            if order:
                order["user_id"] = str(order["user_id"])
                return Order(**order, id=str(order["_id"]))
        except Exception:
            # Invalid ObjectId format
            pass
        return None
    
    @staticmethod
    async def get_with_items(order_id: str) -> Optional[OrderWithItems]:
        db = await get_database()
        try:
            order = await db.orders.find_one({"_id": ObjectId(order_id)})
            if not order:
                return None
            
            # Fetch related order items
            cursor = db.order_items.find({"order_id": ObjectId(order_id)})
            items = []
            
            async for item in cursor:
                # Get product information for each item
                product = await db.products.find_one({"_id": ObjectId(item["product_id"])})
                product_name = product["name"] if product else "Unknown Product"
                
                items.append(OrderItemResponse(
                    id=str(item["_id"]),
                    product_id=str(item["product_id"]),
                    product_name=product_name,
                    quantity=item["quantity"],
                    price=item["price"]
                ))

            # Convert ObjectId to string
            order["user_id"] = str(order["user_id"])
            
            # Remove items field if it exists in the order dict to avoid conflict
            order_data = {k: v for k, v in order.items() if k != "items"}
            
            # Return complete order with items
            return OrderWithItems(**order_data, id=str(order["_id"]), items=items)
        except Exception:
            # Invalid ObjectId format
            return None

    @staticmethod
    async def find_by_partial_id(partial_id: str) -> Optional[OrderWithItems]:
        """Find an order by partial ID (last 8 characters) and return with items"""
        db = await get_database()
        
        # Remove any case and whitespace variations
        partial_id_clean = partial_id.strip().lower()
        
        # If it's a full ObjectId (24 characters), use the regular method
        if len(partial_id_clean) == 24:
            try:
                return await OrderRepository.get_with_items(partial_id_clean)
            except:
                pass
        
        # For partial IDs, search through all orders to find a match
        # This is not the most efficient but will work for the use case
        cursor = db.orders.find({})
        async for order_doc in cursor:
            order_id_str = str(order_doc["_id"]).lower()
            
            # Check if the partial ID matches the end of the order ID
            if order_id_str.endswith(partial_id_clean) or order_id_str[-8:] == partial_id_clean:
                # Found a match, get the full order with items
                return await OrderRepository.get_with_items(str(order_doc["_id"]))
        
        return None
    
    @staticmethod
    async def get_by_user(user_id: str) -> List[Order]:
        db = await get_database()
        cursor = db.orders.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
        orders = []
        async for doc in cursor:
            doc["user_id"] = str(doc["user_id"])
            orders.append(Order(**doc, id=str(doc["_id"])))
        return orders
    @staticmethod
    async def get_all(skip: int = 0, limit: int = 100, status_filter: Optional[str] = None) -> List[Order]:
        db = await get_database()
        query = {}
        if status_filter:
            query["status"] = status_filter
        cursor = db.orders.find(query).skip(skip).limit(limit).sort("created_at", -1)
        orders = []
        async for doc in cursor:
            doc["user_id"] = str(doc["user_id"])
            orders.append(Order(**doc, id=str(doc["_id"])))
        return orders
    
    @staticmethod
    async def update(order_id: str, order_update: OrderUpdate) -> Optional[Order]:
        db = await get_database()
        update_data = {k: v for k, v in order_update.model_dump(exclude_unset=True).items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        if update_data:
            await db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": update_data}
            )
        
        return await OrderRepository.get_by_id(order_id)
    
    @staticmethod
    async def delete(order_id: str) -> bool:
        db = await get_database()
        result = await db.orders.delete_one({"_id": ObjectId(order_id)})
        if result.deleted_count > 0:
            # Also delete related order items
            await db.order_items.delete_many({"order_id": ObjectId(order_id)})
            return True
        return False
    @staticmethod
    async def count(status_filter: Optional[str] = None) -> int:
        db = await get_database()
        query = {}
        if status_filter:
            query["status"] = status_filter
        return await db.orders.count_documents(query)
    
    @staticmethod
    async def count_by_user(user_id: str) -> int:
        db = await get_database()
        return await db.orders.count_documents({"user_id": ObjectId(user_id)})
    @staticmethod
    async def get_total_revenue() -> float:
        db = await get_database()
        pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}]
        result = await db.orders.aggregate(pipeline).to_list(length=1)
        return result[0]["total"] if result else 0
    
    @staticmethod
    async def get_revenue_by_period(days_ago: int) -> float:
        """Get total revenue from a specific number of days ago to now"""
        db = await get_database()
        start_date = datetime.utcnow() - timedelta(days=days_ago)
        
        pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]
        result = await db.orders.aggregate(pipeline).to_list(length=1)
        return result[0]["total"] if result else 0
    
    @staticmethod
    async def get_count_by_period(days_ago: int) -> int:
        """Get order count from a specific number of days ago to now"""
        db = await get_database()
        start_date = datetime.utcnow() - timedelta(days=days_ago)
        
        return await db.orders.count_documents({"created_at": {"$gte": start_date}})
    
    @staticmethod
    async def update_admin(order_id: str, order_update: AdminOrderUpdate) -> Optional[Order]:
        """Admin-specific order update with automatic premium code binding"""
        db = await get_database()
        
        # Get current order to check status changes
        current_order = await OrderRepository.get_by_id(order_id)
        if not current_order:
            return None
        
        update_data = {k: v for k, v in order_update.model_dump(exclude_unset=True).items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Check if payment status is being updated to "paid"
        if (order_update.payment_status == "paid" and 
            current_order.payment_status != "paid" and 
            not getattr(current_order, 'premium_code_id', None)):
            
            # Auto-bind an available premium code
            premium_code = await OrderRepository._find_and_bind_premium_code(order_id, current_order.user_id)
            if premium_code:
                update_data["premium_code_id"] = premium_code.id
        
        if update_data:
            await db.orders.update_one(
                {"_id": ObjectId(order_id)},
                {"$set": update_data}
            )
        
        return await OrderRepository.get_by_id(order_id)
    
    @staticmethod
    async def _find_and_bind_premium_code(order_id: str, user_id: str) -> Optional[Any]:
        """Find an available premium code and bind it to the order"""
        db = await get_database()
        
        # Find an available premium code (not bound, active, not expired)
        query = {
            "bound_user_id": None,
            "is_active": True,
            "$or": [
                {"expires_at": None},
                {"expires_at": {"$gt": datetime.utcnow()}}
            ],
            "$expr": {
                "$lt": ["$used_count", {"$ifNull": ["$usage_limit", float('inf')]}]
            }
        }
        
        available_code = await db.premium_codes.find_one(query)
        if not available_code:
            return None
        
        # Bind the code to the user
        from app.models.product import PremiumCodeBind
        bind_request = PremiumCodeBind(user_email="")  # We'll update this with user email
        
        # Get user email for binding
        from app.repositories.user import UserRepository
        user = await UserRepository.get_by_id(user_id)
        if not user:
            return None
        
        bind_request.user_email = user.email
        
        # Bind the premium code
        bound_code = await PremiumCodeRepository.bind_to_user(str(available_code["_id"]), bind_request)
        return bound_code
    
    @staticmethod
    async def get_with_premium_code(order_id: str) -> Optional[Dict[str, Any]]:
        """Get order with associated premium code information"""
        order = await OrderRepository.get_with_items(order_id)
        if not order:
            return None
        
        result = order.model_dump()
        
        # Add premium code information if exists
        if hasattr(order, 'premium_code_id') and order.premium_code_id:
            premium_code = await PremiumCodeRepository.get_by_id(order.premium_code_id)
            if premium_code:
                result['premium_code'] = {
                    'id': premium_code.id,
                    'code': premium_code.code,
                    'description': premium_code.description,
                    'is_active': premium_code.is_active
                }
        
        return result


class OrderItemRepository:
    @staticmethod
    async def create(order_item: OrderItemCreate) -> str:
        db = await get_database()
        order_item_dict = order_item.model_dump()
        order_item_dict["order_id"] = ObjectId(order_item_dict["order_id"])
        order_item_dict["product_id"] = ObjectId(order_item_dict["product_id"])
        order_item_dict["created_at"] = datetime.utcnow()
        
        result = await db.order_items.insert_one(order_item_dict)
        return str(result.inserted_id)
    
    @staticmethod
    async def get_by_id(item_id: str) -> Optional[OrderItem]:
        db = await get_database()
        item = await db.order_items.find_one({"_id": ObjectId(item_id)})
        if item:
            item["order_id"] = str(item["order_id"])
            item["product_id"] = str(item["product_id"])
            return OrderItem(**item, id=str(item["_id"]))
        return None
    @staticmethod
    async def get_by_order(order_id: str) -> List[OrderItem]:
        db = await get_database()
        cursor = db.order_items.find({"order_id": ObjectId(order_id)})
        items = []
        async for doc in cursor:
            doc["order_id"] = str(doc["order_id"])
            doc["product_id"] = str(doc["product_id"])
            items.append(OrderItem(**doc, id=str(doc["_id"])))
        return items
    
    @staticmethod
    async def update(item_id: str, item_update: OrderItemUpdate) -> Optional[OrderItem]:
        db = await get_database()
        update_data = {k: v for k, v in item_update.model_dump(exclude_unset=True).items() if v is not None}
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await db.order_items.update_one(
                {"_id": ObjectId(item_id)},
                {"$set": update_data}
            )
        
        return await OrderItemRepository.get_by_id(item_id)
    
    @staticmethod
    async def delete(item_id: str) -> bool:
        db = await get_database()
        result = await db.order_items.delete_one({"_id": ObjectId(item_id)})
        return result.deleted_count > 0
