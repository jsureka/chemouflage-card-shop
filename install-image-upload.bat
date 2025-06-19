@echo off
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt

echo Backend dependencies installed successfully!
echo.
echo Don't forget to:
echo 1. Add your Cloudinary configuration to the .env file:
echo    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
echo    CLOUDINARY_API_KEY=your_cloudinary_api_key
echo    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
echo.
echo 2. Restart your backend server
pause
