import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings
from typing import Dict, Any, Optional


class FirebaseApp:
    _app = None
    _db = None
    
    @classmethod
    def initialize(cls):
        """Initialize Firebase application with credentials"""
        if cls._app is None:
            if settings.FIREBASE_CREDENTIALS_PATH:
                # Use service account credentials from file
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                cls._app = firebase_admin.initialize_app(cred)
            elif settings.FIREBASE_CREDENTIALS_JSON:
                # Use service account credentials from environment variable
                import json
                cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
                cred = credentials.Certificate(cred_dict)
                cls._app = firebase_admin.initialize_app(cred)
            else:
                # Use application default credentials
                cls._app = firebase_admin.initialize_app()
            
            print("Firebase application initialized successfully")
    
    @classmethod
    def get_app(cls):
        """Get Firebase application instance"""
        if cls._app is None:
            cls.initialize()
        return cls._app
    
    @classmethod
    def get_db(cls):
        """Get Firestore database instance"""
        if cls._db is None:
            cls.get_app()  # Make sure app is initialized
            cls._db = firestore.client()
        return cls._db


# Initialize Firebase application on import
firebase_app = FirebaseApp()

def get_firestore_db():
    """Get Firestore database instance - to be used in dependency injection"""
    return firebase_app.get_db()

def get_auth():
    """Get Firebase Authentication instance - to be used in dependency injection"""
    firebase_app.get_app()  # Make sure app is initialized
    return auth

async def verify_firebase_token(token: str) -> Dict[str, Any]:
    """
    Verify Firebase ID token and return user information
    
    Args:
        token: Firebase ID token
        
    Returns:
        Dict containing user information
        
    Raises:
        HTTPException: If token is invalid
    """
    try:
        firebase_app.get_app()  # Make sure app is initialized
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase token: {str(e)}")

async def create_custom_token(uid: str, claims: Optional[Dict[str, Any]] = None) -> str:
    """
    Create a custom Firebase token for a user
    
    Args:
        uid: User ID
        claims: Custom claims to include in the token
        
    Returns:
        Custom Firebase token
    """
    firebase_app.get_app()  # Make sure app is initialized
    return auth.create_custom_token(uid, claims)
