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

6. **Database Initialization (Automated)**:

   The database is now automatically initialized when you start the application! The system will:

   - Check database connection
   - Create database indexes if missing
   - Create admin user if missing (requires `ADMIN_PASSWORD` environment variable)
   - Create default payment settings if missing

   Simply start the application and everything will be set up automatically:

   ```
   python main.py
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

### Database Configuration

- `MONGODB_URI` or `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: Name of the database (default: chemouflagedb)

### Authentication & Security

- `SECRET_KEY`: Secret key for JWT token generation
- `REFRESH_TOKEN_SECRET_KEY`: Secret key for refresh tokens
- `ALGORITHM`: Algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 60)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration in days (default: 30)

### Admin User Configuration (for automatic creation)

- `ADMIN_EMAIL`: Email for the default admin user (default: admin@chemouflage.app)
- `ADMIN_PASSWORD`: Password for the default admin user (required for auto-creation)
- `ADMIN_FULL_NAME`: Full name for the admin user (default: Admin User)

### Payment Configuration

- `AAMARPAY_STORE_ID`: AamarPay store ID
- `AAMARPAY_SIGNATURE_KEY`: AamarPay signature key
- `AAMARPAY_SANDBOX`: Enable sandbox mode (default: true)

### Other Settings

- `BACKEND_CORS_ORIGINS`: List of allowed CORS origins
- `REDIS_URL`: Redis connection string
- `MAIL_USERNAME`, `MAIL_PASSWORD`: Email configuration for notifications

## Project Structure

- `app/api/`: API endpoints and router definitions
- `app/core/`: Core configuration and security functions
- `app/db/`: Database connection and initialization
- `app/models/`: Pydantic models for data validation
- `app/repositories/`: Database operations for each entity
- `main.py`: Application entry point

## Note for Integration with React Frontend

This backend is designed to work with the existing React frontend. The API endpoints maintain compatibility with the existing data structures used in the frontend.

# Default Settings Setup Script

## Overview

The `create_default_settings.py` script initializes the default settings for the Chemouflage Card Shop application. This script should be run once after setting up the database to ensure all necessary default configurations are in place.

## What This Script Does

1. **Payment Settings**: Creates default payment method configurations:

   - **AamarPay**: Enabled by default with secure payment processing
   - **Cash on Delivery**: Enabled by default for customers who prefer to pay upon delivery

2. **Delivery Charges**: Sets up default delivery pricing:

   - **Inside Dhaka**: ৳60.00
   - **Outside Dhaka**: ৳120.00

3. **Database Indexes**: Creates essential database indexes for optimal performance:
   - Unique index on user emails
   - Indexes on product categories and status
   - Indexes on order status and dates
   - Unique index on user roles

## Usage

### Prerequisites

1. MongoDB should be running
2. Environment variables should be configured in `.env` file
3. Required dependencies should be installed (`pip install -r requirements.txt`)

### Running the Script

```bash
cd backend
python create_default_settings.py
```

### Environment Variables Required

- `MONGODB_URI` or `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: Name of the database (defaults to 'chemouflagedb')

## Script Features

- **Safety Checks**: Validates environment variables and database connectivity
- **Duplicate Protection**: Checks for existing settings before creating new ones
- **Interactive Prompts**: Asks for confirmation before overwriting existing settings
- **Comprehensive Logging**: Logs all operations to both console and `create_default_settings.log`
- **Error Handling**: Graceful error handling with informative messages

## Default Settings Created

### Payment Methods

```json
{
  "aamarpay": {
    "name": "aamarpay",
    "is_enabled": true,
    "display_name": "AamarPay",
    "description": "Pay securely with AamarPay",
    "icon": "smartphone"
  },
  "cash_on_delivery": {
    "name": "cash_on_delivery",
    "is_enabled": true,
    "display_name": "Cash on Delivery",
    "description": "Pay when you receive your order",
    "icon": "banknote"
  }
}
```

### Delivery Charges

```json
{
  "delivery_charges": {
    "inside_dhaka": 60.0,
    "outside_dhaka": 120.0
  }
}
```

## Troubleshooting

1. **Connection Issues**: Ensure MongoDB is running and accessible
2. **Permission Issues**: Check that the script has write permissions for log files
3. **Environment Issues**: Verify all required environment variables are set
4. **Duplicate Settings**: The script will prompt before overwriting existing settings

## Related Files

- `create_admin_user.py`: Creates the admin user account
- `app/models/settings.py`: Contains the settings data models
- `app/repositories/payment_settings.py`: Database operations for settings
- `app/api/v1/endpoints/settings.py`: API endpoints for settings management

## Notes

- This script is designed to be run once during initial setup
- Settings can be modified later through the admin dashboard
- The script creates database indexes to optimize query performance
- All operations are logged for debugging and audit purposes
