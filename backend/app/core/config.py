import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file from the root directory (parent of backend folder)
root_dir = Path(__file__).parent.parent.parent
env_path = root_dir / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Chemouflage API"
    
    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "chemouflagedb")
    
    # Redis Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_POOL_MAX_CONNECTIONS: int = int(os.getenv("REDIS_POOL_MAX_CONNECTIONS", "20"))
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "300"))  # 5 minutes default
    CACHE_TTL_PRODUCTS: int = int(os.getenv("CACHE_TTL_PRODUCTS", "600"))  # 10 minutes for products
    CACHE_TTL_USER_SESSIONS: int = int(os.getenv("CACHE_TTL_USER_SESSIONS", "3600"))  # 1 hour for sessions
    
    # Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_very_secure_secret_key_here_change_for_production")
    REFRESH_TOKEN_SECRET_KEY: str = os.getenv("REFRESH_TOKEN_SECRET_KEY", "your_refresh_token_secret_key_change_for_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # Email Configuration
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "hello@chemouflage.app")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Chemouflage Card Shop")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "true").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "false").lower() == "true"
    USE_CREDENTIALS: bool = os.getenv("USE_CREDENTIALS", "true").lower() == "true"
    VALIDATE_CERTS: bool = os.getenv("VALIDATE_CERTS", "true").lower() == "true"
    
    # Frontend URL for email links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8080")
    
    # Backend URL for callbacks
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # AamarPay Configuration
    AAMARPAY_SANDBOX: bool = os.getenv("AAMARPAY_SANDBOX", "true").lower() == "true"
    AAMARPAY_STORE_ID: str = os.getenv("AAMARPAY_STORE_ID", "aamarpaytest")
    AAMARPAY_SIGNATURE_KEY: str = os.getenv("AAMARPAY_SIGNATURE_KEY", "dbb74894e82415a2f7ff0ec3a97e4183")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:8080", "http://localhost:8000"]
      # Password Reset
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_HOURS", "24"))
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    
    class Config:
        env_file = str(root_dir / ".env")
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()
