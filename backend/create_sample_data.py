# Chemouflage Sample Data Generator
# Populate the database with sample products and users for testing

import os
import random
from datetime import datetime, timedelta

from bson import ObjectId
from dotenv import load_dotenv
from passlib.context import CryptContext
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_sample_data():
    # Connect to MongoDB
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    # Create sample products
    products = [
        {
            "name": "Chemouflage AR Chemistry Cards",
            "description": "Interactive periodic table cards with augmented reality visualization. Perfect for students learning about the elements and their properties.",
            "price": 199.00,
            "original_price": 299.00,
            "discount_percentage": 33,
            "category": "Education",
            "stock_quantity": 50,
            "is_active": True,
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
            "created_at": datetime.utcnow(),
        },
        {
            "name": "3D Molecular Viewer Pro",
            "description": "Advanced software for visualizing complex molecular structures in 3D. Includes AR capabilities and interactive simulations.",
            "price": 299.00,
            "original_price": 399.00,
            "discount_percentage": 25,
            "category": "Software",
            "stock_quantity": 100,
            "is_active": True,
            "image_url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
            "created_at": datetime.utcnow(),
        },
        {
            "name": "Virtual Chemistry Lab",
            "description": "Conduct safe chemistry experiments in our virtual laboratory environment. Includes 50+ predefined experiments and the ability to create your own.",
            "price": 249.00,
            "original_price": 349.00,
            "discount_percentage": 29,
            "category": "Software",
            "stock_quantity": 75,
            "is_active": True,
            "image_url": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop",
            "created_at": datetime.utcnow(),
        },
        {
            "name": "Complete Chemistry Education Bundle",
            "description": "Our flagship bundle includes AR Chemistry Cards, 3D Molecular Viewer Pro, Virtual Chemistry Lab, and 1-year access to our online educational platform.",
            "price": 599.00,
            "original_price": 899.00,
            "discount_percentage": 33,
            "category": "Bundle",
            "stock_quantity": 30,
            "is_active": True,
            "image_url": "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400&h=300&fit=crop",
            "created_at": datetime.utcnow(),
        },
        {
            "name": "Chemouflage Teacher's Guide",
            "description": "Comprehensive guide for educators on using our products in classroom settings. Includes lesson plans and activity ideas.",
            "price": 49.00,
            "original_price": 69.00,
            "discount_percentage": 29,
            "category": "Education",
            "stock_quantity": 120,
            "is_active": True,
            "image_url": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
            "created_at": datetime.utcnow(),
        }
    ]
    
    # Insert products
    product_ids = []
    for product in products:
        result = db.products.insert_one(product)
        product_ids.append(result.inserted_id)
    
    print(f"Created {len(products)} sample products")
    
    # Create sample users
    users = [
        {
            "email": "user@example.com",
            "full_name": "John Doe",
            "phone": "01712345678",
            "hashed_password": pwd_context.hash("password123"),
            "created_at": datetime.utcnow() - timedelta(days=30),
        },
        {
            "email": "student@example.com",
            "full_name": "Jane Smith",
            "phone": "01812345678",
            "hashed_password": pwd_context.hash("password123"),
            "created_at": datetime.utcnow() - timedelta(days=20),
        },
        {
            "email": "teacher@example.com",
            "full_name": "Robert Johnson",
            "phone": "01912345678",
            "hashed_password": pwd_context.hash("password123"),
            "created_at": datetime.utcnow() - timedelta(days=15),
        }
    ]
    
    # Insert users
    user_ids = []
    for user in users:
        result = db.users.insert_one(user)
        user_id = result.inserted_id
        user_ids.append(user_id)
        
        # Create customer role for each user
        role = {
            "user_id": user_id,
            "role": "customer",
            "created_at": datetime.utcnow(),
        }
        db.user_roles.insert_one(role)
    
    print(f"Created {len(users)} sample users")
    
    # Create sample orders
    order_statuses = ["pending", "processing", "shipped", "delivered"]
    payment_methods = ["bKash", "SSLCommerz", "Cash on Delivery"]
    
    orders = []
    for i in range(10):
        user_id = random.choice(user_ids)
        status = random.choice(order_statuses)
        selected_products = random.sample(list(zip(product_ids, products)), random.randint(1, 3))
        
        total_amount = sum(p[1]["price"] for p in selected_products)
        
        shipping_address = {
            "firstName": "Customer",
            "lastName": "Name",
            "address": "House 12, Road 5",
            "city": "Dhaka",
            "area": "Dhanmondi",
            "zipCode": "1205",
            "phone": "01712345678"
        }
        
        order = {
            "user_id": user_id,
            "total_amount": total_amount,
            "payment_method": random.choice(payment_methods),
            "shipping_address": shipping_address,
            "status": status,
            "created_at": datetime.utcnow() - timedelta(days=random.randint(1, 10)),
        }
        
        result = db.orders.insert_one(order)
        order_id = result.inserted_id
        
        # Create order items
        for product_id, product_data in selected_products:
            order_item = {
                "order_id": order_id,
                "product_id": product_id,
                "quantity": random.randint(1, 3),
                "price": product_data["price"],
                "created_at": datetime.utcnow(),
            }
            db.order_items.insert_one(order_item)
    
    print(f"Created {len(orders)} sample orders with items")
    
    print("Sample data creation completed!")

if __name__ == "__main__":
    create_sample_data()
