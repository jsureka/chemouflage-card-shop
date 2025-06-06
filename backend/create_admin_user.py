import json
import os
from datetime import datetime

from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel
from pymongo import MongoClient

# Script to create a default admin user when the application starts
# Run this script once to set up your admin account


# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AdminSetup(BaseModel):
    email: str
    password: str
    full_name: str

def create_admin_user(admin: AdminSetup):
    # Connect to MongoDB
    client = MongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": admin.email.lower()})
    if existing_user:
        print(f"User {admin.email} already exists.")
        return
    
    # Create user document
    user = {
        "email": admin.email.lower(),
        "full_name": admin.full_name,
        "hashed_password": pwd_context.hash(admin.password),
        "created_at": datetime.utcnow(),
    }
    
    # Insert user
    result = db.users.insert_one(user)
    user_id = result.inserted_id
    
    # Create admin role
    role = {
        "user_id": user_id,
        "role": "admin",
        "created_at": datetime.utcnow(),
    }
    db.user_roles.insert_one(role)
    
    print(f"Admin user {admin.email} created successfully.")
    
if __name__ == "__main__":
    print("Creating default admin user...")
    admin = AdminSetup(
        email="admin@chemouflage.com",
        password="adminpassword123",  # Change this password before running!
        full_name="Admin User"
    )
    create_admin_user(admin)
    print("Done!")
