# Note Management System Documentation

## Overview

A complete note management system that allows users to upload PDF files to Cloudinary and display them with auto-generated thumbnails from the first page of each PDF. Built with FastAPI backend and React frontend.

## Features

### Backend Features
- **PDF Upload**: Upload PDF files directly to Cloudinary
- **Automatic Thumbnails**: Generate thumbnails from the first page of PDFs
- **Database Storage**: Store metadata in MongoDB
- **Authentication**: JWT-based user authentication
- **Search & Pagination**: Search notes by title/description with pagination
- **Permission Control**: Users can only edit/delete their own notes (admins can manage all)

### Frontend Features
- **File Upload Interface**: Drag-and-drop or click to upload PDFs
- **Real-time Search**: Search through notes with live results
- **Responsive Design**: Mobile-friendly grid layout
- **PDF Thumbnails**: Display first page as thumbnail
- **Direct PDF Access**: Click to open PDFs in new tab
- **Download Option**: Download PDFs directly

## API Endpoints

### Note Management
- `POST /api/v1/notes/upload` - Upload a new PDF note
- `GET /api/v1/notes` - Get paginated list of notes with search
- `GET /api/v1/notes/{note_id}` - Get specific note details
- `PUT /api/v1/notes/{note_id}` - Update note metadata
- `DELETE /api/v1/notes/{note_id}` - Delete note (soft delete)
- `GET /api/v1/notes/user/{user_id}` - Get notes by specific user

### Request/Response Examples

#### Upload Note
```bash
curl -X POST "http://localhost:8000/api/v1/notes/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Chemistry Fundamentals" \
  -F "description=Basic chemistry concepts and formulas" \
  -F "file=@chemistry_notes.pdf"
```

#### Get Notes
```bash
curl "http://localhost:8000/api/v1/notes?page=1&page_size=10&search=chemistry"
```

#### Response Format
```json
{
  "notes": [
    {
      "_id": "64a7c8b89f1c5d2e8b3f4a1b",
      "title": "Chemistry Fundamentals",
      "description": "Basic chemistry concepts and formulas",
      "cloudinary_url": "https://res.cloudinary.com/dzacbdici/raw/upload/v1688745656/notes/chemistry_fundamentals.pdf",
      "cloudinary_public_id": "notes/chemistry_fundamentals",
      "thumbnail_url": "https://res.cloudinary.com/dzacbdici/image/upload/c_fill,w_300,h_400,pg_1/v1688745656/notes/chemistry_fundamentals.jpg",
      "file_size": 2048576,
      "uploaded_by": "64a7c8b89f1c5d2e8b3f4a1a",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "is_active": true
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

## Database Schema

### Notes Collection
```javascript
{
  _id: ObjectId,
  title: String,                    // Required, max 200 chars
  description: String,              // Optional, max 1000 chars
  cloudinary_url: String,           // Cloudinary PDF URL
  cloudinary_public_id: String,     // Cloudinary public ID
  thumbnail_url: String,            // Generated thumbnail URL
  file_size: Number,                // File size in bytes
  uploaded_by: String,              // User ID who uploaded
  created_at: Date,                 // Upload timestamp
  updated_at: Date,                 // Last update timestamp
  is_active: Boolean                // Soft delete flag
}
```

### Database Indexes
- Text index on title and description for search
- Index on uploaded_by for user queries
- Index on created_at for sorting
- Index on is_active for filtering
- Unique index on cloudinary_public_id
- Compound indexes for optimized queries

## Environment Configuration

### Backend (.env)
```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/chemouflage_dev
DATABASE_NAME=chemouflage_dev

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# API Configuration
VITE_API_URL=http://localhost:8000
```

### Frontend
The frontend uses the same VITE_API_URL from the backend .env file.

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB (local or cloud)
- Cloudinary account

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env` file

5. Start the server:
   ```bash
   # Using the provided script
   ./start_notes_dev.sh    # On Linux/Mac
   start_notes_dev.bat     # On Windows
   
   # Or manually
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup
1. Navigate to root directory:
   ```bash
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Usage Guide

### For Users
1. **Login**: Use your credentials to login
2. **Upload Note**: Click "Upload Note" button on the notes page
3. **Fill Form**: Enter title, description (optional), and select PDF file
4. **View Notes**: Browse uploaded notes with thumbnails
5. **Search**: Use the search bar to find specific notes
6. **Access PDFs**: Click on thumbnails to open PDFs in new tab

### For Admins
- All user capabilities plus:
- View all users' notes
- Edit any note metadata
- Delete any note

## File Validation
- **File Type**: Only PDF files accepted
- **File Size**: Maximum 50MB per file
- **Title**: Required, 1-200 characters
- **Description**: Optional, max 1000 characters

## Cloudinary Integration

### PDF Storage
- PDFs stored as raw files in Cloudinary
- Organized in "notes" folder
- Public URLs generated for direct access

### Thumbnail Generation
- Automatic thumbnail creation from first page
- Dimensions: 300x400 pixels
- Format: JPG for better compatibility
- URL pattern: `{base_url}/c_fill,w_300,h_400,pg_1/{public_id}.jpg`

## Error Handling

### Common Errors
- **401 Unauthorized**: Invalid or expired token
- **400 Bad Request**: Invalid file type or size
- **404 Not Found**: Note doesn't exist
- **403 Forbidden**: Insufficient permissions
- **500 Internal Server Error**: Server or Cloudinary issues

### Frontend Error Messages
- Upload validation errors
- Network connectivity issues
- Authentication failures
- File size/type restrictions

## Security Features
- JWT token authentication
- File type validation
- File size limits
- User permission checks
- Input sanitization
- SQL injection prevention (MongoDB)

## Performance Optimizations
- Database indexing for fast queries
- Pagination for large datasets
- Cloudinary CDN for file delivery
- Thumbnail caching
- Lazy loading for images
- Search debouncing

## Monitoring & Logging
- API request logging
- Error tracking
- Upload success/failure rates
- Database query performance
- Cloudinary usage metrics

## Troubleshooting

### Common Issues
1. **Upload fails**: Check Cloudinary credentials and file size
2. **Thumbnails not loading**: Verify Cloudinary transformation settings
3. **Authentication errors**: Check token validity and user permissions
4. **Database connection**: Verify MongoDB URL and credentials
5. **CORS issues**: Ensure proper frontend/backend URL configuration

### Debug Mode
Enable debug logging by setting log level to DEBUG in uvicorn command:
```bash
python -m uvicorn main:app --log-level debug
```

## Future Enhancements
- Bulk upload support
- File organization with folders/categories
- Version control for notes
- Collaborative editing
- PDF annotation support
- Advanced search filters
- Usage analytics dashboard

## Support
For issues or questions, please check:
1. API documentation at `/docs`
2. Application logs
3. Database connection status
4. Cloudinary account limits
