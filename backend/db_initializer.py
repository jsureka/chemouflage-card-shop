#!/usr/bin/env python3
"""
Database Initialization Script
Automatically checks and creates database indexes, admin user, and default settings on startup
This script is called during application startup to ensure database is properly configured
"""

import asyncio
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Dict, List, Optional, Tuple

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorClient

from bson import ObjectId
from dotenv import load_dotenv
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from pymongo import ASCENDING, DESCENDING, TEXT
from pymongo.errors import ConnectionFailure, DuplicateKeyError, OperationFailure

# Configure logging
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
    email: EmailStr
    password: str
    full_name: str


class DatabaseInitializer:
    """Handles database initialization tasks"""
    
    def __init__(self, db_client, db_name: str):
        self.client = db_client
        self.db = self.client[db_name]
        
    async def initialize_database(self) -> bool:
        """Main initialization function that runs all checks and setup"""
        logger.info("Starting database initialization...")
        
        try:
            # Test database connection
            if not await self._test_connection():
                logger.error("Database connection failed")
                return False
            
            # Initialize database components
            tasks = []
            
            # Check and create indexes
            if not await self._indexes_exist():
                logger.info("Database indexes not found, creating them...")
                tasks.append(self._create_indexes())
            else:
                logger.info("Database indexes already exist")
            
            # Check and create admin user
            if not await self._admin_user_exists():
                if ADMIN_PASSWORD:
                    logger.info("Admin user not found, creating default admin user...")
                    tasks.append(self._create_admin_user())
                else:
                    logger.warning("Admin user not found and ADMIN_PASSWORD not set in environment")
            else:
                logger.info("Admin user already exists")
            
            # Check and create default settings
            if not await self._default_settings_exist():
                logger.info("Default settings not found, creating them...")
                tasks.append(self._create_default_settings())
            else:
                logger.info("Default settings already exist")
            
            # Run all initialization tasks
            if tasks:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Check if all tasks completed successfully
                success = all(isinstance(result, bool) and result for result in results if not isinstance(result, Exception))
                
                for i, result in enumerate(results):
                    if isinstance(result, Exception):
                        logger.error(f"Task {i} failed with exception: {result}")
                        success = False
                
                if success:
                    logger.info("Database initialization completed successfully")
                else:
                    logger.error("Some database initialization tasks failed")
                    
            else:
                logger.info("Database already initialized, no action needed")
                success = True
                
            return success
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            return False
    
    async def _test_connection(self) -> bool:
        """Test database connection"""
        try:
            # Test connection by getting server info
            await self.client.admin.command('ping')
            logger.info("Database connection successful")
            return True        
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            return False
    
    async def _indexes_exist(self) -> bool:
        """Check if all required database indexes exist"""
        try:
            required_indexes = await self._get_required_indexes()
            
            for collection_name, expected_indexes in required_indexes.items():
                try:
                    collection = self.db[collection_name]
                    existing_indexes = await collection.list_indexes().to_list(length=None)
                    
                    # Convert existing indexes to a set of index keys for comparison
                    existing_index_keys = set()
                    for idx in existing_indexes:
                        if 'key' in idx:
                            # Convert index key to a comparable format
                            key_items = tuple(sorted(idx['key'].items()))
                            existing_index_keys.add(key_items)
                    
                    # Check if all expected indexes exist
                    for index_spec, options in expected_indexes:
                        expected_key = tuple(sorted(index_spec))
                        if expected_key not in existing_index_keys:
                            logger.info(f"Missing index on {collection_name}: {index_spec}")
                            return False
                            
                except Exception as e:
                    logger.warning(f"Error checking indexes for collection {collection_name}: {e}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking indexes: {e}")
            return False
    
    async def _get_required_indexes(self) -> Dict[str, List[Tuple]]:
        """Get all required indexes organized by collection"""
        return {
            'users': [
                ([('email', ASCENDING)], {"unique": True, "background": True}),
                ([('firebase_uid', ASCENDING)], {"sparse": True, "background": True}),
                ([('email_verified', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
            ],
            'user_roles': [
                ([('user_id', ASCENDING)], {"unique": True, "background": True}),
                ([('role', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
            ],
            'products': [
                ([('name', TEXT), ('description', TEXT), ('category', TEXT)], {"background": True}),
                ([('category', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('price', ASCENDING)], {"background": True}),
                ([('category', ASCENDING), ('is_active', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ],
            'orders': [
                ([('user_id', ASCENDING)], {"background": True}),
                ([('status', ASCENDING)], {"background": True}),
                ([('payment_status', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('updated_at', DESCENDING)], {"background": True}),
                ([('premium_code_id', ASCENDING)], {"sparse": True, "background": True}),
                ([('user_id', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
                ([('status', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
                ([('user_id', ASCENDING), ('status', ASCENDING)], {"background": True}),
                # Additional indexes for revenue calculations and search
                ([('created_at', ASCENDING), ('total_amount', ASCENDING)], {"background": True}),
                ([('shipping_address.firstName', TEXT), ('shipping_address.lastName', TEXT), ('shipping_address.phone', TEXT)], {"background": True}),
            ],
            'order_items': [
                ([('order_id', ASCENDING)], {"background": True}),
                ([('product_id', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('order_id', ASCENDING), ('product_id', ASCENDING)], {"background": True}),
            ],
            'premium_codes': [
                ([('code', ASCENDING)], {"unique": True, "background": True}),
                ([('is_active', ASCENDING)], {"background": True}),
                ([('bound_user_id', ASCENDING)], {"sparse": True, "background": True}),
                ([('expires_at', ASCENDING)], {"sparse": True, "background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('expires_at', ASCENDING)], {"background": True}),
                ([('bound_user_id', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ],
            'refresh_tokens': [
                ([('token', ASCENDING)], {"unique": True, "background": True}),
                ([('user_id', ASCENDING)], {"background": True}),
                ([('expires_at', ASCENDING)], {"background": True}),
            ],
            'payment_settings': [
                ([('created_at', DESCENDING)], {"background": True}),
            ],
            'quiz_topics': [
                ([('name', ASCENDING)], {"unique": True, "background": True}),
                ([('name', TEXT)], {"background": True}),  # For text search
                ([('is_active', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ],
            'quiz_questions': [
                ([('topic_id', ASCENDING)], {"background": True}),
                ([('difficulty', ASCENDING)], {"background": True}),
                ([('question_type', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING)], {"background": True}),
                ([('title', TEXT)], {"background": True}),  # For text search
                ([('created_at', DESCENDING)], {"background": True}),
                # Compound indexes for optimized filtering
                ([('topic_id', ASCENDING), ('is_active', ASCENDING), ('difficulty', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('difficulty', ASCENDING), ('question_type', ASCENDING)], {"background": True}),
                ([('topic_id', ASCENDING), ('is_active', ASCENDING)], {"background": True}),
                ([('topic_id', ASCENDING), ('difficulty', ASCENDING)], {"background": True}),
                ([('topic_id', ASCENDING), ('question_type', ASCENDING)], {"background": True}),
                ([('difficulty', ASCENDING), ('question_type', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ],
            'quiz_question_options': [
                ([('question_id', ASCENDING)], {"background": True}),
                ([('question_id', ASCENDING), ('is_correct', ASCENDING)], {"background": True}),
            ],
            'contact_messages': [
                ([('status', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('email', ASCENDING)], {"background": True}),
            ],
        }
    
    async def _admin_user_exists(self) -> bool:
        """Check if admin user exists"""
        try:
            # Check if any user has admin role
            admin_role = await self.db.user_roles.find_one({"role": "admin"})
            return admin_role is not None
            
        except Exception as e:
            logger.error(f"Error checking admin user: {e}")
            return False
    
    async def _default_settings_exist(self) -> bool:
        """Check if default settings exist"""
        try:
            settings = await self.db.payment_settings.find_one()
            return settings is not None
            
        except Exception as e:
            logger.error(f"Error checking default settings: {e}")
            return False
    
    async def _create_indexes(self) -> bool:
        """Create database indexes"""
        try:
            logger.info("Creating database indexes...")
            
            # Users collection indexes
            await self._create_collection_indexes('users', [
                ([('email', ASCENDING)], {"unique": True, "background": True}),
                ([('firebase_uid', ASCENDING)], {"sparse": True, "background": True}),
                ([('email_verified', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
            ])
            
            # User roles collection indexes
            await self._create_collection_indexes('user_roles', [
                ([('user_id', ASCENDING)], {"unique": True, "background": True}),
                ([('role', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
            ])
            
            # Products collection indexes
            await self._create_collection_indexes('products', [
                ([('name', TEXT), ('description', TEXT), ('category', TEXT)], {"background": True}),
                ([('category', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('price', ASCENDING)], {"background": True}),
                ([('category', ASCENDING), ('is_active', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ])
            
            # Orders collection indexes
            await self._create_collection_indexes('orders', [
                ([('user_id', ASCENDING)], {"background": True}),
                ([('status', ASCENDING)], {"background": True}),
                ([('payment_status', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('updated_at', DESCENDING)], {"background": True}),
                ([('premium_code_id', ASCENDING)], {"sparse": True, "background": True}),
                ([('user_id', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
                ([('status', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
                ([('user_id', ASCENDING), ('status', ASCENDING)], {"background": True}),
                # Additional indexes for revenue calculations and search
                ([('created_at', ASCENDING), ('total_amount', ASCENDING)], {"background": True}),
                ([('shipping_address.firstName', TEXT), ('shipping_address.lastName', TEXT), ('shipping_address.phone', TEXT)], {"background": True}),
            ])
            
            # Order items collection indexes
            await self._create_collection_indexes('order_items', [
                ([('order_id', ASCENDING)], {"background": True}),
                ([('product_id', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('order_id', ASCENDING), ('product_id', ASCENDING)], {"background": True}),
            ])
            
            # Premium codes collection indexes
            await self._create_collection_indexes('premium_codes', [
                ([('code', ASCENDING)], {"unique": True, "background": True}),
                ([('is_active', ASCENDING)], {"background": True}),
                ([('bound_user_id', ASCENDING)], {"sparse": True, "background": True}),
                ([('expires_at', ASCENDING)], {"sparse": True, "background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('expires_at', ASCENDING)], {"background": True}),
                ([('bound_user_id', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ])
            
            # Refresh tokens collection indexes
            await self._create_collection_indexes('refresh_tokens', [
                ([('token', ASCENDING)], {"unique": True, "background": True}),
                ([('user_id', ASCENDING)], {"background": True}),
                ([('expires_at', ASCENDING)], {"background": True}),
            ])
              # Payment settings collection indexes
            await self._create_collection_indexes('payment_settings', [
                ([('created_at', DESCENDING)], {"background": True}),
            ])
            
            # Quiz topics collection indexes
            await self._create_collection_indexes('quiz_topics', [
                ([('name', ASCENDING)], {"unique": True, "background": True}),
                ([('name', TEXT)], {"background": True}),  # For text search
                ([('is_active', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ])
            
            # Quiz questions collection indexes
            await self._create_collection_indexes('quiz_questions', [
                ([('topic_id', ASCENDING)], {"background": True}),
                ([('difficulty', ASCENDING)], {"background": True}),
                ([('question_type', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING)], {"background": True}),
                ([('title', TEXT)], {"background": True}),  # For text search
                ([('created_at', DESCENDING)], {"background": True}),
                # Compound indexes for optimized filtering
                ([('topic_id', ASCENDING), ('is_active', ASCENDING), ('difficulty', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('difficulty', ASCENDING), ('question_type', ASCENDING)], {"background": True}),
                ([('topic_id', ASCENDING), ('is_active', ASCENDING)], {"background": True}),
                ([('topic_id', ASCENDING), ('difficulty', ASCENDING)], {"background": True}),
                ([('topic_id', ASCENDING), ('question_type', ASCENDING)], {"background": True}),
                ([('difficulty', ASCENDING), ('question_type', ASCENDING)], {"background": True}),
                ([('is_active', ASCENDING), ('created_at', DESCENDING)], {"background": True}),
            ])
            
            # Quiz question options collection indexes
            await self._create_collection_indexes('quiz_question_options', [
                ([('question_id', ASCENDING)], {"background": True}),
                ([('question_id', ASCENDING), ('is_correct', ASCENDING)], {"background": True}),
            ])
            
            # Contact messages collection indexes
            await self._create_collection_indexes('contact_messages', [
                ([('status', ASCENDING)], {"background": True}),
                ([('created_at', DESCENDING)], {"background": True}),
                ([('email', ASCENDING)], {"background": True}),
            ])
            
            logger.info("Database indexes created successfully")
            return True            
        except Exception as e:           
            logger.error(f"Error creating indexes: {e}")
            return False
    
    
    async def _create_collection_indexes(self, collection_name: str, indexes: List[Tuple]):
        """Create indexes for a specific collection"""
        collection = self.db[collection_name]
        
        for index_spec, options in indexes:
            try:
                logger.debug(f"Attempting to create index on {collection_name}: {repr(index_spec)}, options: {options}")
                await collection.create_index(index_spec, **options)
                logger.debug(f"Created index on {collection_name}: {repr(index_spec)}")
            except DuplicateKeyError:
                logger.debug(f"Index already exists on {collection_name}: {repr(index_spec)}")
            except Exception as e:
                logger.warning(f"Failed to create index on {collection_name} {repr(index_spec)}: {e}")
    
    async def _create_admin_user(self) -> bool:
        """Create default admin user"""
        try:
            if not ADMIN_PASSWORD:
                logger.error("ADMIN_PASSWORD environment variable is required to create admin user")
                return False
            
            admin = AdminUserCreate(
                email=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                full_name=ADMIN_FULL_NAME
            )
            
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
            user_result = await self.db.users.insert_one(user_doc)
            user_id = user_result.inserted_id
            
            # Create admin role
            role_doc = {
                "user_id": user_id,
                "role": "admin",
                "created_at": datetime.utcnow(),
            }
            
            await self.db.user_roles.insert_one(role_doc)
            
            logger.info(f"Admin user created successfully: {admin.email}")
            return True
            
        except DuplicateKeyError:
            logger.warning(f"Admin user {ADMIN_EMAIL} already exists")
            return True
        except Exception as e:
            logger.error(f"Error creating admin user: {e}")
            return False
    
    async def _create_default_settings(self) -> bool:
        """Create default payment settings"""
        try:            # Default payment settings
            default_settings = {
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
                    "inside_dhaka": 60,
                    "outside_dhaka": 120
                },
                "created_at": datetime.utcnow()
            }
            
            # Insert settings
            await self.db.payment_settings.insert_one(default_settings)
            
            logger.info("Default payment settings created successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error creating default settings: {e}")
            return False


async def initialize_database_on_startup(db_client, db_name: str) -> bool:
    """
    Main function to initialize database on application startup
    This should be called from the FastAPI startup event
    """
    initializer = DatabaseInitializer(db_client, db_name)
    return await initializer.initialize_database()


def validate_environment() -> bool:
    """Validate required environment variables"""
    if not MONGODB_URI:
        logger.error("MONGODB_URI environment variable is required")
        return False
    
    if not DATABASE_NAME:
        logger.error("DATABASE_NAME environment variable is required")
        return False
    
    return True


# Standalone script execution
async def main():
    """Main function for standalone script execution"""
    if not validate_environment():
        sys.exit(1)
    
    # Import here to avoid circular imports
    from motor.motor_asyncio import AsyncIOMotorClient
    
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(MONGODB_URI)
    
    try:
        success = await initialize_database_on_startup(client, DATABASE_NAME)
        sys.exit(0 if success else 1)
    finally:
        client.close()


if __name__ == "__main__":
    # Configure logging for standalone execution
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('db_initializer.log')
        ]
    )
    
    asyncio.run(main())
