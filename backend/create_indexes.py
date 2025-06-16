#!/usr/bin/env python3
"""
MongoDB Indexes Creation Script
Run this script once to set up database indexes for better performance
This script creates all necessary indexes for the Chemouflage Card Shop application
"""

import logging
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple

from dotenv import load_dotenv
from pymongo import ASCENDING, DESCENDING, TEXT, MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError, OperationFailure

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('create_indexes.log')
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

def create_index_safely(collection, index_spec: List[Tuple], options: Dict = None) -> bool:
    """Create index with error handling"""
    try:
        if options:
            result = collection.create_index(index_spec, **options)
        else:
            result = collection.create_index(index_spec)
        logger.info(f"Created index: {result}")
        return True
    except DuplicateKeyError:
        logger.warning(f"Index already exists: {index_spec}")
        return True
    except OperationFailure as e:
        logger.error(f"Failed to create index {index_spec}: {e}")
        return False

def create_indexes():
    """Create all database indexes"""
    validate_environment()
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
        
        if not test_connection(client):
            sys.exit(1)
            
        db = client[DATABASE_NAME]
        logger.info(f"Connected to database: {DATABASE_NAME}")
        
        success_count = 0
        total_indexes = 0
        
        # Users collection indexes
        logger.info("Creating users collection indexes...")
        indexes = [
            # Unique indexes
            (("email", ASCENDING), {"unique": True, "background": True}),
            # Query optimization indexes
            (("firebase_uid", ASCENDING), {"sparse": True, "background": True}),
            (("email_verified", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.users, index_spec, options):
                success_count += 1
        
        # User roles collection indexes
        logger.info("Creating user_roles collection indexes...")
        indexes = [
            (("user_id", ASCENDING), {"unique": True, "background": True}),
            (("role", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.user_roles, index_spec, options):
                success_count += 1
        
        # Products collection indexes
        logger.info("Creating products collection indexes...")
        indexes = [
            # Text search index
            ([("name", TEXT), ("description", TEXT), ("category", TEXT)], {"background": True}),
            # Query optimization indexes
            (("category", ASCENDING), {"background": True}),
            (("is_active", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
            (("price", ASCENDING), {"background": True}),
            # Compound indexes for common queries
            ([("category", ASCENDING), ("is_active", ASCENDING)], {"background": True}),
            ([("is_active", ASCENDING), ("created_at", DESCENDING)], {"background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.products, index_spec, options):
                success_count += 1
        
        # Orders collection indexes
        logger.info("Creating orders collection indexes...")
        indexes = [
            (("user_id", ASCENDING), {"background": True}),
            (("status", ASCENDING), {"background": True}),
            (("payment_status", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
            (("updated_at", DESCENDING), {"background": True}),
            (("premium_code_id", ASCENDING), {"sparse": True, "background": True}),
            # Compound indexes for common queries
            ([("user_id", ASCENDING), ("created_at", DESCENDING)], {"background": True}),
            ([("status", ASCENDING), ("created_at", DESCENDING)], {"background": True}),
            ([("user_id", ASCENDING), ("status", ASCENDING)], {"background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.orders, index_spec, options):
                success_count += 1
        
        # Order items collection indexes
        logger.info("Creating order_items collection indexes...")
        indexes = [
            (("order_id", ASCENDING), {"background": True}),
            (("product_id", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
            # Compound index for order details
            ([("order_id", ASCENDING), ("product_id", ASCENDING)], {"background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.order_items, index_spec, options):
                success_count += 1
        
        # Premium codes collection indexes
        logger.info("Creating premium_codes collection indexes...")
        indexes = [
            (("code", ASCENDING), {"unique": True, "background": True}),
            (("is_active", ASCENDING), {"background": True}),
            (("bound_user_id", ASCENDING), {"sparse": True, "background": True}),
            (("expires_at", ASCENDING), {"sparse": True, "background": True}),
            (("created_at", DESCENDING), {"background": True}),
            # Compound indexes for common queries
            ([("is_active", ASCENDING), ("expires_at", ASCENDING)], {"background": True}),
            ([("bound_user_id", ASCENDING), ("created_at", DESCENDING)], {"background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.premium_codes, index_spec, options):
                success_count += 1
        
        # Refresh tokens collection indexes
        logger.info("Creating refresh_tokens collection indexes...")
        indexes = [
            (("token", ASCENDING), {"unique": True, "background": True}),
            (("user_id", ASCENDING), {"background": True}),
            (("expires_at", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
            # TTL index for automatic cleanup
            (("expires_at", ASCENDING), {"expireAfterSeconds": 0, "background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.refresh_tokens, index_spec, options):
                success_count += 1
        
        # Password reset tokens collection indexes
        logger.info("Creating password_reset_tokens collection indexes...")
        indexes = [
            (("token", ASCENDING), {"unique": True, "background": True}),
            (("user_id", ASCENDING), {"background": True}),
            (("expires_at", ASCENDING), {"background": True}),
            (("used", ASCENDING), {"background": True}),
            (("created_at", DESCENDING), {"background": True}),
            # TTL index for automatic cleanup
            (("expires_at", ASCENDING), {"expireAfterSeconds": 0, "background": True}),
        ]
        
        for index_spec, options in indexes:
            total_indexes += 1
            if create_index_safely(db.password_reset_tokens, index_spec, options):
                success_count += 1
        
        # Close connection
        client.close()
        
        logger.info(f"Index creation completed: {success_count}/{total_indexes} indexes created successfully")
        
        if success_count == total_indexes:
            logger.info("✅ All indexes created successfully!")
            return True
        else:
            logger.warning(f"⚠️  Some indexes failed to create ({total_indexes - success_count} failed)")
            return False
            
    except Exception as e:
        logger.error(f"Unexpected error during index creation: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting MongoDB index creation...")
    success = create_indexes()
    sys.exit(0 if success else 1)
