from datetime import datetime
from enum import Enum
from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from app.models.user import PyObjectId


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuestionType(str, Enum):
    DESCRIPTIVE = "descriptive"
    SHORT_ANSWER = "short_answer"
    MULTIPLE_CHOICE = "multiple_choice"


# Topic Models
class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class TopicCreate(TopicBase):
    pass


class TopicUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TopicInDB(TopicBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class Topic(TopicBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    question_count: int = 0  # Number of questions in this topic
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


# Question Option Models (for multiple choice questions)
class QuestionOptionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    image_url: Optional[str] = None
    is_correct: bool = False


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    image_url: Optional[str] = None
    is_correct: Optional[bool] = None


class QuestionOption(QuestionOptionBase):
    id: str
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


# Question Models
class QuestionBase(BaseModel):
    topic_id: str
    title: str = Field(..., min_length=1, max_length=500)
    image_url: Optional[str] = None
    difficulty: DifficultyLevel
    question_type: QuestionType
    is_active: bool = True
    # For multiple choice questions, options will be stored separately
    # For descriptive and short answer, options are not needed


class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = None  # Only for multiple choice


class QuestionUpdate(BaseModel):
    topic_id: Optional[str] = None
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    image_url: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    question_type: Optional[QuestionType] = None
    is_active: Optional[bool] = None
    options: Optional[List[QuestionOptionCreate]] = None  # For updating options


class QuestionInDB(QuestionBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class Question(QuestionBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    options: Optional[List[QuestionOption]] = None  # Only populated for multiple choice
    topic_name: Optional[str] = None  # Populated when fetched with topic info
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


# Response models for admin
class QuestionWithOptions(Question):
    """Question with all options (including correct answers) - for admin use"""
    pass


class QuestionForUser(BaseModel):
    """Question for regular users (without correct answers marked)"""
    id: str
    topic_id: str
    title: str
    image_url: Optional[str] = None
    difficulty: DifficultyLevel
    question_type: QuestionType
    options: Optional[List[dict]] = None  # Options without is_correct field
    topic_name: Optional[str] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


# Quiz Statistics Models
class TopicStatsResponse(BaseModel):
    topic: Topic
    total_questions: int
    questions_by_difficulty: dict  # {"easy": 5, "medium": 3, "hard": 2}
    questions_by_type: dict  # {"multiple_choice": 7, "descriptive": 2, "short_answer": 1}


class QuizStatsResponse(BaseModel):
    total_topics: int
    total_questions: int
    active_topics: int
    active_questions: int
    questions_by_difficulty: dict
    questions_by_type: dict
    topics_with_stats: List[TopicStatsResponse]
