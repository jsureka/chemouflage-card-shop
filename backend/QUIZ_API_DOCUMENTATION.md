# Quiz System API Documentation

This document provides comprehensive information about the Quiz System API endpoints in the Chemouflage backend.

## Overview

The Quiz System allows administrators to create topics and questions, while providing users with access to quizzes. The system supports three types of questions:

1. **Multiple Choice** - Questions with 2-5 options, exactly one correct answer
2. **Short Answer** - Questions requiring brief text responses
3. **Descriptive** - Questions requiring detailed explanations

## Models

### Topic Models

```python
class Topic:
    id: str
    name: str                    # Unique topic name
    description: Optional[str]   # Topic description
    is_active: bool             # Whether topic is active
    created_at: datetime
    updated_at: Optional[datetime]
    question_count: int         # Number of active questions in topic
```

### Question Models

```python
class Question:
    id: str
    topic_id: str               # Reference to topic
    title: str                  # Question text
    image_url: Optional[str]    # Optional question image
    difficulty: DifficultyLevel # easy, medium, hard
    question_type: QuestionType # descriptive, short_answer, multiple_choice
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    options: Optional[List[QuestionOption]]  # Only for multiple choice
    topic_name: Optional[str]   # Populated when fetched with topic info

class QuestionOption:
    id: str
    title: str                  # Option text
    image_url: Optional[str]    # Optional option image
    is_correct: bool           # Whether this is the correct answer
```

## API Endpoints

### Topics Endpoints

#### 1. Create Topic

**POST** `/api/v1/quiz/topics/`

**Authorization:** Admin only

**Request Body:**

```json
{
  "name": "Programming Fundamentals",
  "description": "Basic programming concepts and principles",
  "is_active": true
}
```

**Response:** `201 Created`

```json
{
  "id": "647a1b5c8f9e2d3a4b5c6d7e",
  "name": "Programming Fundamentals",
  "description": "Basic programming concepts and principles",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": null,
  "question_count": 0
}
```

#### 2. Get All Topics

**GET** `/api/v1/quiz/topics/`

**Authorization:** Any authenticated user

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `active_only` (bool): Filter only active topics (default: true)
- `search` (string): Search topics by name

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "647a1b5c8f9e2d3a4b5c6d7e",
      "name": "Programming Fundamentals",
      "description": "Basic programming concepts and principles",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": null,
      "question_count": 5
    }
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 20,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

#### 3. Get Topic by ID

**GET** `/api/v1/quiz/topics/{topic_id}`

**Authorization:** Any authenticated user

**Response:** `200 OK` - Returns single topic object

#### 4. Update Topic

**PUT** `/api/v1/quiz/topics/{topic_id}`

**Authorization:** Admin only

**Request Body:** (All fields optional)

```json
{
  "name": "Advanced Programming",
  "description": "Advanced programming concepts",
  "is_active": false
}
```

#### 5. Delete Topic

**DELETE** `/api/v1/quiz/topics/{topic_id}`

**Authorization:** Admin only

**Response:** `204 No Content`

**Note:** If topic has questions, it will be soft deleted (marked inactive). If no questions exist, it will be permanently deleted.

#### 6. Get Topic Questions Count

**GET** `/api/v1/quiz/topics/{topic_id}/questions-count`

**Authorization:** Any authenticated user

**Response:** `200 OK`

```json
{
  "topic_id": "647a1b5c8f9e2d3a4b5c6d7e",
  "topic_name": "Programming Fundamentals",
  "total_questions": 10,
  "active_questions": 8
}
```

### Questions Endpoints

#### 1. Create Question

**POST** `/api/v1/quiz/questions/`

**Authorization:** Admin only

**Multiple Choice Example:**

```json
{
  "topic_id": "647a1b5c8f9e2d3a4b5c6d7e",
  "title": "What is a variable in programming?",
  "image_url": "https://example.com/image.jpg",
  "difficulty": "easy",
  "question_type": "multiple_choice",
  "options": [
    {
      "title": "A container for storing data values",
      "image_url": "https://example.com/option1.jpg",
      "is_correct": true
    },
    {
      "title": "A function that performs calculations",
      "is_correct": false
    },
    {
      "title": "A loop structure",
      "is_correct": false
    }
  ]
}
```

**Short Answer/Descriptive Example:**

```json
{
  "topic_id": "647a1b5c8f9e2d3a4b5c6d7e",
  "title": "What does OOP stand for?",
  "difficulty": "easy",
  "question_type": "short_answer"
}
```

**Validation Rules:**

- Multiple choice questions must have 2-5 options with exactly one correct answer
- Short answer and descriptive questions cannot have options
- Topic must exist

#### 2. Get All Questions (Admin)

**GET** `/api/v1/quiz/questions/`

**Authorization:** Admin only

**Query Parameters:**

- `page`, `limit`: Pagination
- `topic_id`: Filter by topic
- `difficulty`: Filter by difficulty (easy, medium, hard)
- `question_type`: Filter by type (descriptive, short_answer, multiple_choice)
- `active_only`: Filter active questions (default: true)
- `search`: Search by question title

#### 3. Get Questions for Users

**GET** `/api/v1/quiz/questions/public`

**Authorization:** Any authenticated user

**Same query parameters as admin endpoint**

**Note:** Returns questions without correct answer information for multiple choice questions.

#### 4. Get Random Questions

**GET** `/api/v1/quiz/questions/random`

**Authorization:** Any authenticated user

**Query Parameters:**

- `limit` (int): Number of questions (1-50, default: 10)
- `topic_id`: Filter by topic
- `difficulty`: Filter by difficulty

**Response:** Array of QuestionForUser objects

#### 5. Get Question by ID (Admin)

**GET** `/api/v1/quiz/questions/{question_id}`

**Authorization:** Admin only

#### 6. Get Question by ID (Public)

**GET** `/api/v1/quiz/questions/{question_id}/public`

**Authorization:** Any authenticated user

**Note:** Returns question without correct answer information.

#### 7. Update Question

**PUT** `/api/v1/quiz/questions/{question_id}`

**Authorization:** Admin only

**Request Body:** All fields optional, same structure as create

#### 8. Delete Question

**DELETE** `/api/v1/quiz/questions/{question_id}`

**Authorization:** Admin only

**Response:** `204 No Content`

**Note:** Permanently deletes question and all its options.

### Statistics Endpoints

#### 1. Get Overall Quiz Statistics

**GET** `/api/v1/quiz/stats/`

**Authorization:** Admin only

**Response:** `200 OK`

```json
{
  "total_topics": 5,
  "total_questions": 25,
  "active_topics": 4,
  "active_questions": 22,
  "questions_by_difficulty": {
    "easy": 10,
    "medium": 8,
    "hard": 4
  },
  "questions_by_type": {
    "multiple_choice": 15,
    "short_answer": 4,
    "descriptive": 3
  },
  "topics_with_stats": [
    {
      "topic": {
        "id": "647a1b5c8f9e2d3a4b5c6d7e",
        "name": "Programming Fundamentals",
        "description": "Basic programming concepts",
        "is_active": true,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": null,
        "question_count": 5
      },
      "total_questions": 5,
      "questions_by_difficulty": {
        "easy": 3,
        "medium": 2,
        "hard": 0
      },
      "questions_by_type": {
        "multiple_choice": 3,
        "short_answer": 1,
        "descriptive": 1
      }
    }
  ]
}
```

#### 2. Get All Topics Statistics

**GET** `/api/v1/quiz/stats/topics`

**Authorization:** Admin only

**Response:** Array of TopicStatsResponse objects

#### 3. Get Topic Statistics

**GET** `/api/v1/quiz/stats/topics/{topic_id}`

**Authorization:** Admin only

**Response:** Single TopicStatsResponse object

#### 4. Get Quiz Summary (Public)

**GET** `/api/v1/quiz/stats/summary`

**Authorization:** Any authenticated user

**Response:** `200 OK`

```json
{
  "total_active_topics": 4,
  "total_active_questions": 22,
  "topics": [
    {
      "id": "647a1b5c8f9e2d3a4b5c6d7e",
      "name": "Programming Fundamentals",
      "description": "Basic programming concepts",
      "question_count": 5
    }
  ]
}
```

## Error Responses

### Common Error Codes

- `400 Bad Request`: Invalid input data or validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (admin required)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Example Error Response

```json
{
  "detail": "Topic with this name already exists"
}
```

## Database Collections

### quiz_topics

```javascript
{
  "_id": ObjectId,
  "name": String,        // Unique index
  "description": String,
  "is_active": Boolean,
  "created_at": Date,
  "updated_at": Date
}
```

### quiz_questions

```javascript
{
  "_id": ObjectId,
  "topic_id": String,    // Index
  "title": String,
  "image_url": String,
  "difficulty": String,  // Index: easy, medium, hard
  "question_type": String, // Index: descriptive, short_answer, multiple_choice
  "is_active": Boolean,  // Index
  "created_at": Date,    // Index
  "updated_at": Date
}
```

### quiz_question_options

```javascript
{
  "_id": ObjectId,
  "question_id": String, // Index
  "title": String,
  "image_url": String,
  "is_correct": Boolean, // Index
  "created_at": Date
}
```

## Sample Usage

### Creating a Complete Quiz Flow

1. **Create Topic**

```bash
curl -X POST "/api/v1/quiz/topics/" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JavaScript Basics",
    "description": "Fundamental JavaScript concepts"
  }'
```

2. **Create Multiple Choice Question**

```bash
curl -X POST "/api/v1/quiz/questions/" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "{topic_id}",
    "title": "Which keyword is used to declare a variable in JavaScript?",
    "difficulty": "easy",
    "question_type": "multiple_choice",
    "options": [
      {"title": "var", "is_correct": true},
      {"title": "variable", "is_correct": false},
      {"title": "v", "is_correct": false}
    ]
  }'
```

3. **Get Random Questions for Quiz**

```bash
curl -X GET "/api/v1/quiz/questions/random?limit=5&topic_id={topic_id}" \
  -H "Authorization: Bearer {user_token}"
```

4. **Check Statistics**

```bash
curl -X GET "/api/v1/quiz/stats/" \
  -H "Authorization: Bearer {admin_token}"
```

## Best Practices

1. **Question Creation:**

   - Keep question titles clear and concise
   - Use images sparingly and ensure they're accessible
   - For multiple choice, ensure options are mutually exclusive
   - Validate that exactly one option is marked correct

2. **Topic Management:**

   - Use descriptive topic names
   - Group related questions logically
   - Soft delete topics with existing questions

3. **Performance:**

   - Use pagination for large result sets
   - Cache frequently accessed data
   - Use appropriate filters to reduce data transfer

4. **Security:**
   - Admin-only endpoints for content management
   - User endpoints don't expose correct answers
   - Validate all input data

## Testing

Sample data can be created using the provided script:

```bash
python create_sample_quiz_data.py
```

This creates 5 topics with various types of questions for testing.
