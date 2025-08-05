from datetime import datetime
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from app.models.user import PyObjectId


class UserQuizScoreBase(BaseModel):
    user_id: str
    score: int = 0
    streak: int = 0
    total_answered: int = 0
    correct_answers: int = 0


class UserQuizScoreCreate(UserQuizScoreBase):
    pass


class UserQuizScoreUpdate(BaseModel):
    score: Optional[int] = None
    streak: Optional[int] = None
    total_answered: Optional[int] = None
    correct_answers: Optional[int] = None


class UserQuizScoreInDB(UserQuizScoreBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class UserQuizScore(UserQuizScoreBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


class DailyScoreBase(BaseModel):
    user_id: str
    user_email: str
    user_name: str
    date: str  # Format: YYYY-MM-DD
    daily_score: int = 0
    daily_streak: int = 0
    questions_answered: int = 0
    correct_answers: int = 0


class DailyScoreCreate(DailyScoreBase):
    pass


class DailyScoreUpdate(BaseModel):
    daily_score: Optional[int] = None
    daily_streak: Optional[int] = None
    questions_answered: Optional[int] = None
    correct_answers: Optional[int] = None


class DailyScoreInDB(DailyScoreBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class DailyScore(DailyScoreBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {
        "populate_by_name": True,
        "json_encoders": {ObjectId: str}
    }


# Response models
class QuizSubmissionResponse(BaseModel):
    is_correct: bool
    correct_option_id: str
    explanation: Optional[str] = None
    score: int
    streak: int
    daily_score: int
    daily_streak: int


class DailyLeaderboardEntry(BaseModel):
    user_name: str
    daily_score: int
    daily_streak: int
    questions_answered: int
    correct_answers: int
    accuracy_percentage: float


class DailyLeaderboardResponse(BaseModel):
    date: str
    leaderboard: list[DailyLeaderboardEntry]