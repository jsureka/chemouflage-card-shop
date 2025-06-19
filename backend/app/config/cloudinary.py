import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional
from fastapi import HTTPException, status

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

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
