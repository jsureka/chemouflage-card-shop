import logging
from typing import Any, Dict, Optional

import firebase_admin
import httpx
from firebase_admin import auth, credentials

from app.core.config import settings

logger = logging.getLogger(__name__)

class FirebaseAuthService:
    _instance = None
    _app = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseAuthService, cls).__new__(cls)
            cls._instance._initialize_firebase()
        return cls._instance
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                if settings.FIREBASE_CREDENTIALS_PATH:
                    # Use service account key file
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    self._app = firebase_admin.initialize_app(cred)
                    logger.info("Firebase initialized with service account credentials")
                elif settings.FIREBASE_PROJECT_ID:
                    # Use default credentials (useful for Cloud Run, App Engine, etc.)
                    cred = credentials.ApplicationDefault()
                    self._app = firebase_admin.initialize_app(cred, {
                        'projectId': settings.FIREBASE_PROJECT_ID,
                    })
                    logger.info("Firebase initialized with application default credentials")
                else:
                    logger.warning("Firebase credentials not configured. Firebase authentication will not work.")
                    self._app = None
            else:
                self._app = firebase_admin.get_app()
                logger.info("Using existing Firebase app instance")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self._app = None
    
    async def verify_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase ID token and return decoded token data
        
        Args:
            id_token: Firebase ID token from frontend
            
        Returns:
            Dict containing user data if valid, None otherwise
        """
        if not self._app:
            logger.error("Firebase not initialized")
            return None
            
        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            
            # Extract user information
            user_data = {
                'uid': decoded_token.get('uid'),
                'email': decoded_token.get('email'),
                'email_verified': decoded_token.get('email_verified', False),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture'),
                'firebase_claims': decoded_token
            }
            
            logger.info(f"Successfully verified Firebase token for user: {user_data['email']}")
            return user_data
            
        except auth.ExpiredIdTokenError:
            logger.warning("Firebase ID token has expired")
            return None
        except auth.InvalidIdTokenError:
            logger.warning("Firebase ID token is invalid")
            return None
        except Exception as e:
            logger.error(f"Error verifying Firebase ID token: {str(e)}")
            return None
    
    async def get_user_by_uid(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Get Firebase user by UID
        
        Args:
            uid: Firebase user UID
            
        Returns:
            Dict containing user data if found, None otherwise
        """
        if not self._app:
            logger.error("Firebase not initialized")
            return None
            
        try:
            user_record = auth.get_user(uid)
            user_data = {
                'uid': user_record.uid,
                'email': user_record.email,
                'email_verified': user_record.email_verified,
                'display_name': user_record.display_name,
                'photo_url': user_record.photo_url,
                'provider_data': [
                    {
                        'provider_id': provider.provider_id,
                        'uid': provider.uid,
                        'email': provider.email,
                        'display_name': provider.display_name,
                        'photo_url': provider.photo_url
                    } for provider in user_record.provider_data
                ]
            }
            return user_data
        except auth.UserNotFoundError:
            logger.warning(f"Firebase user not found: {uid}")
            return None
        except Exception as e:
            logger.error(f"Error getting Firebase user: {str(e)}")
            return None
    
    async def create_custom_token(self, uid: str, additional_claims: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Create a custom token for a Firebase user
        
        Args:
            uid: Firebase user UID
            additional_claims: Optional additional claims to include
            
        Returns:
            Custom token string if successful, None otherwise
        """
        if not self._app:
            logger.error("Firebase not initialized")
            return None
            
        try:
            custom_token = auth.create_custom_token(uid, additional_claims)
            return custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token
        except Exception as e:
            logger.error(f"Error creating custom token: {str(e)}")
            return None
    
    async def authenticate_with_email_password(self, email: str, password: str) -> Optional[dict]:
        """
        Authenticate with Firebase using email and password via REST API.
        Returns user info dict if successful, None otherwise.
        """
        if not settings.FIREBASE_API_KEY:
            logger.error("FIREBASE_API_KEY not set in settings.")
            return None
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={settings.FIREBASE_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data
                else:
                    logger.warning(f"Firebase email/password login failed: {resp.text}")
                    return None
            except Exception as e:
                logger.error(f"Error authenticating with Firebase REST API: {str(e)}")
                return None
    
    async def register_with_email_password(self, email: str, password: str, display_name: str = None) -> Optional[dict]:
        """
        Register a user in Firebase using email and password via REST API.
        Returns user info dict if successful, None otherwise.
        """
        if not settings.FIREBASE_API_KEY:
            logger.error("FIREBASE_API_KEY not set in settings.")
            return None
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={settings.FIREBASE_API_KEY}"
        payload = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        if display_name:
            payload["displayName"] = display_name
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data
                else:
                    logger.warning(f"Firebase registration failed: {resp.text}")
                    return None
            except Exception as e:
                logger.error(f"Error registering with Firebase REST API: {str(e)}")
                return None
    
    async def update_password_with_email(self, email: str, new_password: str) -> bool:
        """
        Update a user's password in Firebase using the REST API (requires idToken, so use Admin SDK instead).
        Returns True if successful, False otherwise.
        """
        # Try to get user by email using Admin SDK
        try:
            if not self._app:
                logger.error("Firebase not initialized")
                return False
            user_record = auth.get_user_by_email(email)
            auth.update_user(user_record.uid, password=new_password)
            return True
        except Exception as e:
            logger.error(f"Error updating Firebase password for {email}: {str(e)}")
            return False
    
    def is_configured(self) -> bool:
        """Check if Firebase is properly configured"""
        return self._app is not None
    
    async def validate_firebase_user_data(self, firebase_user_data: Dict[str, Any]) -> bool:
        """Validate Firebase user data before creating MongoDB user"""
        required_fields = ['uid', 'email']
        for field in required_fields:
            if not firebase_user_data.get(field):
                logger.error(f"Missing required Firebase field: {field}")
                return False
        
        # Validate email format
        email = firebase_user_data.get('email', '')
        if '@' not in email or '.' not in email:
            logger.error(f"Invalid email format from Firebase: {email}")
            return False
        
        return True

# Singleton instance
firebase_auth_service = FirebaseAuthService()
