import random
from datetime import datetime
from typing import List

from app.models.quiz import QuestionOption


def get_today_date() -> str:
    """Get today's date in YYYY-MM-DD format"""
    return datetime.utcnow().strftime("%Y-%m-%d")


def shuffle_options(options: List[QuestionOption]) -> List[QuestionOption]:
    """Shuffle question options randomly"""
    shuffled = options.copy()
    random.shuffle(shuffled)
    return shuffled


def convert_options_for_reaction_game(options: List) -> List[dict]:
    """Convert options to reaction game format (remove is_correct field)"""
    result = []
    for option in options:
        if isinstance(option, dict):
            # Handle dictionary format (from get_random_questions)
            result.append({
                "id": option["id"],
                "title": option["title"],
                "image_url": option.get("image_url")
            })
        else:
            # Handle object format (QuestionOption)
            result.append({
                "id": option.id,
                "title": option.title,
                "image_url": option.image_url
            })
    return result


def calculate_streak_bonus(streak: int) -> int:
    """Calculate bonus points based on current streak"""
    if streak < 3:
        return 0
    elif streak < 5:
        return 1
    elif streak < 10:
        return 2
    else:
        return 3


def calculate_score_for_correct_answer(streak: int, base_points: int = 10) -> int:
    """Calculate score for a correct answer including streak bonus"""
    return base_points + calculate_streak_bonus(streak)