import os
import uuid
from datetime import datetime

import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Firebase Initialization
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    if firebase_admin._apps:
        # Firebase already initialized
        return
    
    if FIREBASE_CREDENTIALS_PATH:
        # Use service account credentials from file
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    elif FIREBASE_CREDENTIALS_JSON:
        # Use service account credentials from environment variable
        import json
        cred_dict = json.loads(FIREBASE_CREDENTIALS_JSON)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    else:
        # Use application default credentials
        firebase_admin.initialize_app()
    
    print("Firebase initialized")

def clean_document(doc):
    """Clean MongoDB document for Firestore"""
    # Convert _id to string
    if '_id' in doc:
        doc['mongo_id'] = str(doc.pop('_id'))
    
    # Convert all ObjectIDs to strings
    for key, value in list(doc.items()):
        if hasattr(value, '__str__') and '_id' in str(type(value)):
            doc[key] = str(value)
        elif isinstance(value, dict):
            doc[key] = clean_document(value)
        elif isinstance(value, list):
            doc[key] = [clean_document(item) if isinstance(item, dict) else 
                        str(item) if hasattr(item, '__str__') and '_id' in str(type(item)) else item 
                        for item in value]
    return doc

def migrate_collection(mongo_db, firestore_db, collection_name):
    """Migrate a MongoDB collection to Firestore"""
    print(f"Migrating {collection_name}...")
    
    # Get the MongoDB collection
    mongo_collection = mongo_db[collection_name]
    
    # Get the Firestore collection reference
    firestore_collection = firestore_db.collection(collection_name)
      # Count documents
    count = mongo_collection.count_documents({})
    print(f"Found {count} documents in {collection_name}")
    
    # Special case for settings collection - use a single document with fixed ID
    if collection_name == "settings":
        document = mongo_collection.find_one()        
        if document:
            # Clean the document for Firestore
            cleaned_doc = clean_document(document)
            
            # Use fixed document ID for settings
            doc_id = "payment_settings"
            
            # Add document ID to the document itself for easier access
            cleaned_doc['id'] = doc_id
            
            # Add to Firestore
            firestore_collection.document(doc_id).set(cleaned_doc)
            print(f"Migrated payment settings to settings/payment_settings")
        return
    
    # Batch migration in groups of 500 (Firestore batch limit)
    migrated = 0
    batch_size = 500
    
    for document in mongo_collection.find():
        # Clean the document for Firestore
        cleaned_doc = clean_document(document)
        
        # Generate a document ID for Firestore
        doc_id = str(uuid.uuid4())
        
        # Add document ID to the document itself for easier access
        cleaned_doc['doc_id'] = doc_id
        
        # Add to Firestore
        firestore_collection.document(doc_id).set(cleaned_doc)
        
        migrated += 1
        if migrated % 100 == 0:
            print(f"Migrated {migrated}/{count} documents")
    
    print(f"Completed migrating {migrated} documents from {collection_name}")

def migrate_data():
    """Migrate all data from MongoDB to Firestore"""
    # Connect to MongoDB
    mongo_client = MongoClient(MONGODB_URI)
    mongo_db = mongo_client[DATABASE_NAME]
      # Initialize Firebase
    initialize_firebase()
    firestore_db = firestore.client()
    
    # Collections to migrate
    collections = [
        "users", 
        "user_roles", 
        "products",
        "orders",
        "order_items",
        "premium_codes",
        "contact_messages",
        "settings"  # Note: This will use "payment_settings" document ID in the settings collection
    ]
    
    # Migrate each collection
    for collection in collections:
        try:
            migrate_collection(mongo_db, firestore_db, collection)
        except Exception as e:
            print(f"Error migrating {collection}: {e}")
    
    print("Migration completed")

if __name__ == "__main__":
    migrate_data()
