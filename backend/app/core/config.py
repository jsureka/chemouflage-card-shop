import os
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Chemouflage API"
    
    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "chemouflagedb")
      # Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_very_secure_secret_key_here_change_for_production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Email Configuration
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "noreply@chemouflage.com")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Chemouflage Card Shop")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "true").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "false").lower() == "true"
    USE_CREDENTIALS: bool = os.getenv("USE_CREDENTIALS", "true").lower() == "true"
    VALIDATE_CERTS: bool = os.getenv("VALIDATE_CERTS", "true").lower() == "true"
    
    # Frontend URL for email links
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Backend URL for callbacks
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # AamarPay Configuration
    AAMARPAY_SANDBOX: bool = os.getenv("AAMARPAY_SANDBOX", "true").lower() == "true"
    AAMARPAY_STORE_ID: str = os.getenv("AAMARPAY_STORE_ID", "aamarpaytest")
    AAMARPAY_SIGNATURE_KEY: str = os.getenv("AAMARPAY_SIGNATURE_KEY", "dbb74894e82415a2f7ff0ec3a97e4183")
    
    # CORS"http://localhost:5173",
    BACKEND_CORS_ORIGINS: List[str] = [ "http://localhost:8080", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
