import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional
from fastapi import HTTPException, status
from dotenv import load_dotenv
from pathlib import Path

# Ensure .env file is loaded for Cloudinary config
backend_dir = Path(__file__).resolve().parent.parent.parent
env_path = backend_dir / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"[cloudinary.py] Loaded .env from: {env_path}")
else:
    print(f"[cloudinary.py] WARNING: .env file not found at {env_path}")

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Debug print to verify configuration
print(f"[cloudinary.py] CLOUDINARY_CLOUD_NAME: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
print(f"[cloudinary.py] CLOUDINARY_API_KEY: {os.getenv('CLOUDINARY_API_KEY')}")
print(f"[cloudinary.py] CLOUDINARY_API_SECRET: {'*' * len(os.getenv('CLOUDINARY_API_SECRET', '')) if os.getenv('CLOUDINARY_API_SECRET') else 'None'}")

def validate_cloudinary_config():
    """Validate that Cloudinary is properly configured"""
    if not all([
        os.getenv("CLOUDINARY_CLOUD_NAME"),
        os.getenv("CLOUDINARY_API_KEY"),
        os.getenv("CLOUDINARY_API_SECRET")
    ]):
        raise ValueError("Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file")

class CloudinaryService:
    @staticmethod
    async def upload_image(file_content: bytes, filename: str, folder: str = "products") -> Optional[str]:
        """
        Upload image to Cloudinary and return the public URL
        """
        try:
            # Validate configuration
            validate_cloudinary_config()
            
            # Generate a unique public_id
            public_id = f"{folder}/{filename}"
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_content,
                public_id=public_id,
                overwrite=True,
                resource_type="image",
                transformation=[
                    {"width": 800, "height": 600, "crop": "limit"},
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            
            return result.get("secure_url")
            
        except ValueError as e:
            print(f"Cloudinary configuration error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary not configured: {str(e)}"
            )
        except Exception as e:
            print(f"Error uploading to Cloudinary: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload image: {str(e)}"
            )

    @staticmethod
    async def upload_pdf(file_content: bytes, filename: str, folder: str = "notes") -> tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Upload PDF to Cloudinary and return the public URL, public_id, and thumbnail URL
        Returns: (pdf_url, public_id, thumbnail_url)
        """
        try:
            # Validate configuration
            validate_cloudinary_config()
            
            # Generate a unique public_id
            public_id = f"{folder}/{filename}"
            
            # Upload PDF to Cloudinary
            result = cloudinary.uploader.upload(
                file_content,
                public_id=public_id,
                overwrite=True,
                resource_type="raw",  # Use 'raw' for PDF files
                format="pdf"
            )
            
            pdf_url = result.get("secure_url")
            cloudinary_public_id = result.get("public_id")
            
            # Generate thumbnail URL from first page of PDF
            cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
            thumbnail_url = f"https://res.cloudinary.com/{cloud_name}/image/upload/c_fill,w_300,h_400,pg_1/{cloudinary_public_id}.jpg"
            
            return pdf_url, cloudinary_public_id, thumbnail_url
            
        except ValueError as e:
            print(f"Cloudinary configuration error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary not configured: {str(e)}"
            )
        except Exception as e:
            print(f"Error uploading PDF to Cloudinary: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload PDF: {str(e)}"
            )
    
    @staticmethod
    async def delete_image(public_id: str) -> bool:
        """
        Delete image from Cloudinary
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting from Cloudinary: {str(e)}")
            return False
    
    @staticmethod
    def extract_public_id_from_url(url: str) -> Optional[str]:
        """
        Extract public_id from Cloudinary URL
        """
        try:
            if "cloudinary.com" in url:
                # Extract public_id from URL
                parts = url.split("/")
                # Find the upload part and get everything after it
                upload_index = parts.index("upload")
                if upload_index < len(parts) - 1:
                    # Skip transformation part if exists
                    start_index = upload_index + 1
                    if parts[start_index].startswith("v"):
                        start_index += 1
                    
                    # Join the remaining parts and remove file extension
                    public_id = "/".join(parts[start_index:])
                    # Remove file extension
                    if "." in public_id:
                        public_id = public_id.rsplit(".", 1)[0]
                    return public_id
            return None
        except Exception:
            return None
