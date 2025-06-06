# MongoDB Indexes Creation Script
# Run this script once to set up database indexes for better performance

import os

from dotenv import load_dotenv
from pymongo import ASCENDING, TEXT, MongoClient

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

def create_indexes():
    # Connect to MongoDB
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print("Creating indexes...")
    
    # Users collection indexes
    print("Creating user indexes...")
    db.users.create_index("email", unique=True)
    
    # User roles collection indexes
    print("Creating user_roles indexes...")
    db.user_roles.create_index("user_id", unique=True)
    
    # Products collection indexes
    print("Creating product indexes...")
    db.products.create_index([("name", TEXT), ("description", TEXT), ("category", TEXT)])
    db.products.create_index("category")
    db.products.create_index("is_active")
    db.products.create_index("created_at")
    
    # Orders collection indexes
    print("Creating order indexes...")
    db.orders.create_index("user_id")
    db.orders.create_index("status")
    db.orders.create_index("created_at")
    
    # Order items collection indexes
    print("Creating order_items indexes...")
    db.order_items.create_index("order_id")
    db.order_items.create_index("product_id")
    
    print("All indexes created successfully!")

if __name__ == "__main__":
    create_indexes()
