from typing import Any

from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.models.quiz_score import DailyLeaderboardEntry, DailyLeaderboardResponse
from app.models.user import User
from app.repositories.quiz_score import DailyScoreRepository
from app.utils.quiz_game import get_today_date

router = APIRouter()


@router.get("/daily", response_model=DailyLeaderboardResponse)
async def get_daily_scoreboard(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get today's top 3 users from daily scoreboard.
    """
    today = get_today_date()
    
    # Get top 3 users for today
    top_scores = await DailyScoreRepository.get_daily_leaderboard(today, limit=3)
    
    # Convert to leaderboard format
    leaderboard = []
    for score in top_scores:
        # Calculate accuracy percentage
        accuracy_percentage = 0.0
        if score.questions_answered > 0:
            accuracy_percentage = (score.correct_answers / score.questions_answered) * 100
        
        entry = DailyLeaderboardEntry(
            user_name=score.user_name,
            daily_score=score.daily_score,
            daily_streak=score.daily_streak,
            questions_answered=score.questions_answered,
            correct_answers=score.correct_answers,
            accuracy_percentage=round(accuracy_percentage, 1)
        )
        leaderboard.append(entry)
    
    return DailyLeaderboardResponse(
        date=today,
        leaderboard=leaderboard
    )