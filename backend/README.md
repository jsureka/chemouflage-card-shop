# Chemouflage Backend - FastAPI with MongoDB

This directory contains the FastAPI backend server for the Chemouflage Card Shop.

## Features

- Authentication with JWT tokens
- User roles (customers and admins)
- Product management
- Order and payment processing
- Admin dashboard statistics

## Requirements

- Python 3.8+
- MongoDB
- FastAPI

## Setup

1. Make sure you have Python 3.8+ installed on your system.

2. Install and start MongoDB:

   - On Windows, install [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
   - On macOS: `brew install mongodb-community`
   - On Linux, follow the [official installation guide](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

3. Create and activate a virtual environment:

   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # macOS/Linux
   ```

4. Install the requirements:

   ```
   pip install -r requirements.txt
   ```

5. Configure your environment variables in the `.env` file.

6. Run the database setup scripts:

   ```
   python create_indexes.py
   python create_admin_user.py
   ```

7. (Optional) Create sample data:

   ```
   python create_sample_data.py
   ```

8. Start the server:
   ```
   uvicorn main:app --reload
   ```

## Quick Start

For convenience, you can use the provided scripts:

- Windows: `start.bat`
- macOS/Linux: `./start.sh`

## API Documentation

Once running, access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Default Admin User

A default admin user is created with the following credentials:

- Email: admin@chemouflage.com
- Password: adminpassword123

Make sure to change this password in production!

## Environment Variables

Configure these in the `.env` file:

- `MONGODB_URI`: MongoDB connection string
- `DATABASE_NAME`: Name of the database
- `SECRET_KEY`: Secret key for JWT token generation
- `ALGORITHM`: Algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes
- `BACKEND_CORS_ORIGINS`: List of allowed CORS origins

## Project Structure

- `app/api/`: API endpoints and router definitions
- `app/core/`: Core configuration and security functions
- `app/db/`: Database connection and initialization
- `app/models/`: Pydantic models for data validation
- `app/repositories/`: Database operations for each entity
- `main.py`: Application entry point

## Note for Integration with React Frontend

This backend is designed to work with the existing React frontend. The API endpoints maintain compatibility with the existing data structures used in the frontend.
