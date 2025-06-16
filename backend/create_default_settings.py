#!/usr/bin/env python3
"""
Default Settings Creation Script
Run this script once to set up default settings for the Chemouflage Card Shop application
This script creates default payment settings and delivery charges
"""

import logging
import os
import sys
from datetime import datetime
from pathlib import Path

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('create_default_settings.log')
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

def get_default_payment_settings() -> dict:
    """Get default payment settings configuration"""
    return {
        "aamarpay": {
            "name": "aamarpay",
            "is_enabled": True,
            "display_name": "AamarPay",
            "description": "Pay securely with AamarPay",
            "icon": "smartphone"
        },
        "cash_on_delivery": {
            "name": "cash_on_delivery",
            "is_enabled": True,
            "display_name": "Cash on Delivery",
            "description": "Pay when you receive your order",
            "icon": "banknote"
        },
        "delivery_charges": {
            "inside_dhaka": 60.0,
            "outside_dhaka": 120.0
        }
    }

def check_existing_settings(db) -> bool:
    """Check if default settings already exist"""
    try:
        # Check if payment settings exist
        existing_settings = db.payment_settings.count_documents({})
        
        logger.info(f"Existing payment settings count: {existing_settings}")
        
        return existing_settings > 0
        
    except Exception as e:
        logger.error(f"Error checking existing settings: {e}")
        return False

def create_default_settings() -> bool:
    """Create default settings with proper error handling"""
    validate_environment()
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
        
        if not test_connection(client):
            return False
            
        db = client[DATABASE_NAME]
        logger.info(f"Connected to database: {DATABASE_NAME}")
        
        # Check existing settings
        settings_exist = check_existing_settings(db)
        
        if settings_exist:
            logger.warning("Default settings already exist!")
            response = input("Do you want to reset to default settings? (y/N): ").strip().lower()
            if response != 'y':
                logger.info("Operation cancelled")
                return False
            
            # Clear existing settings
            result = db.payment_settings.delete_many({})
            logger.info(f"Cleared {result.deleted_count} existing settings")
        
        # Create new default settings
        return create_new_default_settings(db)
        
    except Exception as e:
        logger.error(f"Unexpected error during default settings creation: {e}")
        return False
    finally:
        try:
            client.close()
        except:
            pass

def create_new_default_settings(db) -> bool:
    """Create new default settings"""
    try:
        # Get default settings
        default_settings = get_default_payment_settings()
        
        # Create settings document
        settings_doc = {
            **default_settings,
            "created_at": datetime.utcnow(),
        }
        
        # Insert settings
        settings_result = db.payment_settings.insert_one(settings_doc)
        settings_id = settings_result.inserted_id
        
        logger.info(f"Created default payment settings with ID: {settings_id}")
        
        # Log the created settings
        logger.info("✅ Default settings created successfully!")
        logger.info(f"   Settings ID: {settings_id}")
        logger.info(f"   AamarPay: {'Enabled' if default_settings['aamarpay']['is_enabled'] else 'Disabled'}")
        logger.info(f"   Cash on Delivery: {'Enabled' if default_settings['cash_on_delivery']['is_enabled'] else 'Disabled'}")
        logger.info(f"   Delivery Charges - Inside Dhaka: ৳{default_settings['delivery_charges']['inside_dhaka']}")
        logger.info(f"   Delivery Charges - Outside Dhaka: ৳{default_settings['delivery_charges']['outside_dhaka']}")
        
        return True
        
    except DuplicateKeyError as e:
        logger.error(f"Duplicate settings found: {e}")
        return False
    except Exception as e:
        logger.error(f"Error creating default settings: {e}")
        return False

def create_additional_default_collections(db) -> bool:
    """Create indexes and other default database setup if needed"""
    try:
        logger.info("Creating database indexes...")
        
        # Create indexes for payment_settings collection
        db.payment_settings.create_index("created_at")
        
        # Create indexes for other collections if they don't exist
        if "users" in db.list_collection_names():
            db.users.create_index("email", unique=True)
            logger.info("Created unique index on users.email")
        
        if "products" in db.list_collection_names():
            db.products.create_index("name")
            db.products.create_index("category")
            db.products.create_index("is_active")
            logger.info("Created indexes on products collection")
        
        if "orders" in db.list_collection_names():
            db.orders.create_index("user_id")
            db.orders.create_index("status")
            db.orders.create_index("created_at")
            logger.info("Created indexes on orders collection")
        
        if "user_roles" in db.list_collection_names():
            db.user_roles.create_index("user_id", unique=True)
            logger.info("Created unique index on user_roles.user_id")
        
        logger.info("✅ Database indexes created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")
        return False

def main():
    """Main function"""
    logger.info("=== Chemouflage Card Shop - Default Settings Setup ===")
    
    # Create default settings
    success = create_default_settings()
    
    if success:
        logger.info("\n🎉 Default settings setup completed successfully!")
        logger.info("The application is now ready with default payment and delivery settings.")
        
        # Optionally create database indexes
        try:
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
            db = client[DATABASE_NAME]
            create_additional_default_collections(db)
            client.close()
        except Exception as e:
            logger.warning(f"Could not create additional indexes: {e}")
        
    else:
        logger.error("❌ Default settings setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
