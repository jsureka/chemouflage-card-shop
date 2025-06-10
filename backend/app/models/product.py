from datetime import datetime
from typing import List, Optional, Union

from app.models.user import PyObjectId
from bson import ObjectId
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = 0
    category: Optional[str] = None
    stock_quantity: Optional[int] = 0
    is_active: Optional[bool] = True
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None
    image_url: Optional[str] = None

class ProductInDB(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class Product(ProductBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


# Order models
class ShippingAddress(BaseModel):
    firstName: str
    lastName: str
    address: str
    city: str
    area: str
    zipCode: Optional[str] = None
    phone: str

class OrderBase(BaseModel):
    user_id: str
    total_amount: float
    delivery_charge: float = 0.0  # Delivery charge for this order
    payment_method: Optional[str] = None
    shipping_address: ShippingAddress
    status: str = "pending"  # pending, processing, shipped, delivered, cancelled
    payment_status: str = "pending"  # pending, paid, failed, refunded
    delivery_status: str = "pending"  # pending, preparing, shipped, delivered
    premium_code_id: Optional[str] = None  # Bound premium code when payment is confirmed

class OrderCreate(OrderBase):
    items: Optional[List[dict]] = None  # Will contain {product_id, quantity, price}

class OrderUpdate(BaseModel):
    payment_method: Optional[str] = None
    shipping_address: Optional[ShippingAddress] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    delivery_status: Optional[str] = None
    total_amount: Optional[float] = None
    delivery_charge: Optional[float] = None
    premium_code_id: Optional[str] = None

class AdminOrderUpdate(BaseModel):
    """Admin-specific order update with validation for status fields"""
    status: Optional[str] = None  # pending, processing, shipped, delivered, cancelled
    payment_status: Optional[str] = None  # pending, paid, failed, refunded
    delivery_status: Optional[str] = None  # pending, preparing, shipped, delivered
    payment_method: Optional[str] = None
    shipping_address: Optional[ShippingAddress] = None
    total_amount: Optional[float] = None
    delivery_charge: Optional[float] = None
    delivery_charge: Optional[float] = None

class OrderInDB(OrderBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class Order(OrderBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }

# Order item models
class OrderItemBase(BaseModel):
    order_id: str
    product_id: str
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = None
    price: Optional[float] = None

class OrderItemInDB(OrderItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class OrderItem(OrderItemBase):
    id: str
    created_at: datetime
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }

# Order with items response
class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    price: float
    
    model_config = {
        "populate_by_name": True
    }

class OrderWithItems(Order):
    items: List[OrderItemResponse]


# Premium code models
class PremiumCodeBase(BaseModel):
    code: str
    description: Optional[str] = None
    is_active: bool = True
    usage_limit: Optional[int] = 1  # How many times this code can be used
    used_count: int = 0
    expires_at: Optional[datetime] = None

class PremiumCodeCreate(BaseModel):
    description: Optional[str] = None
    is_active: bool = True
    usage_limit: Optional[int] = 1
    expires_at: Optional[datetime] = None

class PremiumCodeUpdate(BaseModel):
    description: Optional[str] = None
    is_active: Optional[bool] = None
    usage_limit: Optional[int] = None
    expires_at: Optional[datetime] = None

class PremiumCodeInDB(PremiumCodeBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    bound_user_id: Optional[str] = None  # User this code is bound to
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PremiumCode(PremiumCodeBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    bound_user_id: Optional[PyObjectId] = None
    bound_user_email: Optional[str] = None  # For display purposes
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }

class PremiumCodeBind(BaseModel):
    user_email: str

class PremiumCodeGenerate(BaseModel):
    count: int = 1
    description: Optional[str] = None
    usage_limit: Optional[int] = 1
    expires_at: Optional[datetime] = None
