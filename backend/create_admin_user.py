#!/usr/bin/env python3
"""
Admin User Creation Script
Run this script once to set up your admin account for the Chemouflage Card Shop application
This script creates a default admin user with proper role assignments
"""

import getpass
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from bson import ObjectId
from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ValidationError
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('create_admin_user.log')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
root_dir = Path(__file__).parent.parent
env_path = root_dir / ".env"
load_dotenv(dotenv_path=env_path)

# MongoDB connection configuration
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "chemouflagedb")

# Admin user configuration from environment
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@chemouflage.app")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
ADMIN_FULL_NAME = os.getenv("ADMIN_FULL_NAME", "Admin User")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AdminUserCreate(BaseModel):
    """Model for creating admin user"""
    email: EmailStr
    password: str
    full_name: str
    
    class Config:
        """Pydantic config"""
        str_strip_whitespace = True

def validate_environment():
    """Validate required environment variables"""
    if not MONGODB_URI:
        logger.error("MONGODB_URI environment variable is required")
        sys.exit(1)
    
    if not DATABASE_NAME:
        logger.error("DATABASE_NAME environment variable is required")
        sys.exit(1)
    
    logger.info(f"MongoDB URI: {MONGODB_URI}")
    logger.info(f"Database Name: {DATABASE_NAME}")

def test_connection(client: MongoClient) -> bool:
    """Test MongoDB connection"""
    try:
        # Test connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        return True
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return False

def get_admin_credentials() -> AdminUserCreate:
    """Get admin credentials from user input or environment"""
    
    # Try to use environment variables first
    if ADMIN_PASSWORD:
        try:
            admin = AdminUserCreate(
                email=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                full_name=ADMIN_FULL_NAME
            )
            logger.info(f"Using admin credentials from environment for: {admin.email}")
            return admin
        except ValidationError as e:
            logger.error(f"Invalid admin credentials in environment: {e}")
    
    # Interactive input
    logger.info("Admin credentials not found in environment variables.")
    logger.info("Please provide admin user details:")
    
    while True:
        try:
            email = input(f"Admin Email [{ADMIN_EMAIL}]: ").strip() or ADMIN_EMAIL
            full_name = input(f"Full Name [{ADMIN_FULL_NAME}]: ").strip() or ADMIN_FULL_NAME
            
            # Get password securely
            password = getpass.getpass("Admin Password: ")
            if not password:
                logger.error("Password cannot be empty")
                continue
            
            # Confirm password
            password_confirm = getpass.getpass("Confirm Password: ")
            if password != password_confirm:
                logger.error("Passwords do not match")
                continue
            
            # Validate and create admin user object
            admin = AdminUserCreate(
                email=email,
                password=password,
                full_name=full_name
            )
            
            return admin
            
        except ValidationError as e:
            logger.error(f"Invalid input: {e}")
            continue
        except KeyboardInterrupt:
            logger.info("\nOperation cancelled by user")
            sys.exit(0)

def check_existing_users(db) -> tuple[bool, bool]:
    """Check if admin user or any users exist"""
    try:
        # Check total user count
        total_users = db.users.count_documents({})
        
        # Check if admin user already exists
        admin_exists = db.users.find_one({"email": ADMIN_EMAIL.lower()}) is not None
        
        logger.info(f"Total users in database: {total_users}")
        
        return admin_exists, total_users > 0
        
    except Exception as e:
        logger.error(f"Error checking existing users: {e}")
        return False, False

def create_admin_user(admin: AdminUserCreate) -> bool:
    """Create admin user with proper error handling"""
    validate_environment()
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
        
        if not test_connection(client):
            return False
            
        db = client[DATABASE_NAME]
        logger.info(f"Connected to database: {DATABASE_NAME}")
        
        # Check existing users
        admin_exists, users_exist = check_existing_users(db)
        
        if admin_exists:
            logger.warning(f"Admin user {admin.email} already exists!")
            response = input("Do you want to update the existing admin user? (y/N): ").strip().lower()
            if response != 'y':
                logger.info("Operation cancelled")
                return False
            
            # Update existing admin user
            return update_admin_user(db, admin)
        
        if users_exist:
            logger.warning("Database already contains users!")
            response = input("Are you sure you want to add another admin user? (y/N): ").strip().lower()
            if response != 'y':
                logger.info("Operation cancelled")
                return False
        
        # Create new admin user
        return create_new_admin_user(db, admin)
        
    except Exception as e:
        logger.error(f"Unexpected error during admin user creation: {e}")
        return False
    finally:
        try:
            client.close()
        except:
            pass

def create_new_admin_user(db, admin: AdminUserCreate) -> bool:
    """Create a new admin user"""
    try:
        # Hash password
        hashed_password = pwd_context.hash(admin.password)
        
        # Create user document
        user_doc = {
            "email": admin.email.lower(),
            "full_name": admin.full_name,
            "hashed_password": hashed_password,
            "email_verified": True,  # Admin users are pre-verified
            "created_at": datetime.utcnow(),
        }
        
        # Insert user
        user_result = db.users.insert_one(user_doc)
        user_id = user_result.inserted_id
        
        logger.info(f"Created admin user with ID: {user_id}")
        
        # Create admin role
        role_doc = {
            "user_id": user_id,
            "role": "admin",
            "created_at": datetime.utcnow(),
        }
        
        role_result = db.user_roles.insert_one(role_doc)
        logger.info(f"Created admin role with ID: {role_result.inserted_id}")
        
        logger.info(f"✅ Admin user {admin.email} created successfully!")
        logger.info(f"   User ID: {user_id}")
        logger.info(f"   Full Name: {admin.full_name}")
        logger.info(f"   Email Verified: Yes")
        
        return True
        
    except DuplicateKeyError as e:
        logger.error(f"User with email {admin.email} already exists: {e}")
        return False
    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        return False

def update_admin_user(db, admin: AdminUserCreate) -> bool:
    """Update existing admin user"""
    try:
        # Hash new password
        hashed_password = pwd_context.hash(admin.password)
        
        # Update user document
        update_doc = {
            "$set": {
                "full_name": admin.full_name,
                "hashed_password": hashed_password,
                "email_verified": True,
                "updated_at": datetime.utcnow(),
            }
        }
        
        # Update user
        user_result = db.users.update_one(
            {"email": admin.email.lower()},
            update_doc
        )
        
        if user_result.modified_count == 0:
            logger.error("Failed to update admin user")
            return False
        
        # Get user ID for role check
        user_doc = db.users.find_one({"email": admin.email.lower()})
        user_id = user_doc["_id"]
        
        # Ensure admin role exists
        existing_role = db.user_roles.find_one({"user_id": user_id})
        
        if not existing_role:
            # Create admin role
            role_doc = {
                "user_id": user_id,
                "role": "admin",
                "created_at": datetime.utcnow(),
            }
            role_result = db.user_roles.insert_one(role_doc)
            logger.info(f"Created admin role with ID: {role_result.inserted_id}")
        elif existing_role.get("role") != "admin":
            # Update role to admin
            db.user_roles.update_one(
                {"user_id": user_id},
                {"$set": {"role": "admin", "updated_at": datetime.utcnow()}}
            )
            logger.info("Updated user role to admin")
        
        logger.info(f"✅ Admin user {admin.email} updated successfully!")
        logger.info(f"   User ID: {user_id}")
        logger.info(f"   Full Name: {admin.full_name}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error updating admin user: {e}")
        return False

def main():
    """Main function"""
    logger.info("=== Chemouflage Card Shop - Admin User Setup ===")
    
    # Get admin credentials
    admin = get_admin_credentials()
    
    # Create admin user
    success = create_admin_user(admin)
    
    if success:
        logger.info("🎉 Admin user setup completed successfully!")
        logger.info("You can now log in to the admin dashboard with these credentials.")
    else:
        logger.error("❌ Admin user setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
