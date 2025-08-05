from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class QuizSessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class QuizSessionAnswer(BaseModel):
    question_id: str
    selected_option_id: str
    is_correct: bool
    answered_at: datetime


class QuizSessionCreate(BaseModel):
    user_id: str
    question_ids: List[str]
    started_at: datetime = Field(default_factory=datetime.utcnow)


class QuizSessionUpdate(BaseModel):
    current_question_index: Optional[int] = None
    answers: Optional[List[QuizSessionAnswer]] = None
    status: Optional[QuizSessionStatus] = None
    completed_at: Optional[datetime] = None
    total_time_seconds: Optional[int] = None


class QuizSessionInDB(QuizSessionCreate):
    id: str
    current_question_index: int = 0
    answers: List[QuizSessionAnswer] = Field(default_factory=list)
    status: QuizSessionStatus = QuizSessionStatus.ACTIVE
    completed_at: Optional[datetime] = None
    total_time_seconds: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class QuizSession(QuizSessionInDB):
    pass


class QuizSessionResponse(BaseModel):
    id: str
    user_id: str
    question_ids: List[str]
    current_question_index: int
    answers: List[QuizSessionAnswer]
    status: QuizSessionStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_time_seconds: Optional[int] = None


class QuizSessionStartRequest(BaseModel):
    question_count: int = Field(default=10, ge=1, le=50)


class QuizSessionAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    selected_option_id: str


class QuizSessionCompleteResponse(BaseModel):
    session_id: str
    total_questions: int
    correct_answers: int
    total_time_seconds: int
    score_earned: int
    streak_achieved: int
    daily_score: int
    daily_streak: int
