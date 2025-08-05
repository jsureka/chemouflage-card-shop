from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.dependencies import get_current_user
from app.models.quiz import QuestionType
from app.models.quiz_score import (
    DailyScoreUpdate,
    QuizSubmissionResponse,
    UserQuizScoreUpdate,
)
from app.models.user import User
from app.repositories.quiz_question import QuestionRepository
from app.repositories.quiz_score import DailyScoreRepository, UserQuizScoreRepository
from app.utils.quiz_game import (
    calculate_score_for_correct_answer,
    convert_options_for_reaction_game,
    get_today_date,
    shuffle_options,
)

router = APIRouter()


class QuizSubmissionRequest(BaseModel):
    question_id: str
    selected_option_id: str


@router.get("/reaction-question", response_model=dict)
async def get_reaction_question(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a random multiple choice question for reaction game.
    Returns question with blank (____) in title and shuffled options without is_correct.
    """
    # Get random multiple choice questions
    questions = await QuestionRepository.get_random_questions(
        question_type=QuestionType.MULTIPLE_CHOICE,
        limit=1
    )
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No multiple choice questions available"
        )
    
    question = questions[0]
    
    # Verify question has options
    if not question.options:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Question has no options"
        )
    
    # Convert title to have blank (replace a key word with ____)
    # For chemistry questions, we'll replace chemical elements, compounds, or key terms
    title_with_blank = create_title_with_blank(question.title)
    
    # Shuffle options and remove is_correct field
    shuffled_options = shuffle_options(question.options)
    user_safe_options = convert_options_for_reaction_game(shuffled_options)
    
    return {
        "id": question.id,
        "topic_id": question.topic_id,
        "title": title_with_blank,
        "image_url": question.image_url,
        "difficulty": question.difficulty,
        "question_type": question.question_type,
        "options": user_safe_options,
        "topic_name": question.topic_name
    }


@router.post("/submit", response_model=QuizSubmissionResponse)
async def submit_quiz_answer(
    request: QuizSubmissionRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Submit quiz answer and update scores.
    Returns correctness, updated score, and streak information.
    """
    # Get the question with correct answers (admin view)
    db_question = await QuestionRepository.get_by_id(request.question_id)
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Find the correct option
    correct_option = None
    selected_option = None
    
    for option in db_question.options or []:
        if option.is_correct:
            correct_option = option
        if option.id == request.selected_option_id:
            selected_option = option
    
    if not correct_option:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Question has no correct answer"
        )
    
    if not selected_option:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected option not found"
        )
    
    # Check if answer is correct
    is_correct = request.selected_option_id == correct_option.id
    
    # Get current user scores
    user_score = await UserQuizScoreRepository.get_by_user_id(current_user.id)
    if not user_score:
        # Create initial score
        user_score = await UserQuizScoreRepository.upsert(
            current_user.id,
            UserQuizScoreUpdate(score=0, streak=0, total_answered=0, correct_answers=0)
        )
    
    # Calculate new scores
    new_total_answered = user_score.total_answered + 1
    new_correct_answers = user_score.correct_answers + (1 if is_correct else 0)
    
    if is_correct:
        new_streak = user_score.streak + 1
        score_increase = calculate_score_for_correct_answer(user_score.streak)
        new_score = user_score.score + score_increase
    else:
        new_streak = 0
        new_score = user_score.score
    
    # Update user quiz score
    updated_user_score = await UserQuizScoreRepository.upsert(
        current_user.id,
        UserQuizScoreUpdate(
            score=new_score,
            streak=new_streak,
            total_answered=new_total_answered,
            correct_answers=new_correct_answers
        )
    )
    
    # Update daily score
    today = get_today_date()
    daily_score = await DailyScoreRepository.get_by_user_and_date(current_user.id, today)
    
    if not daily_score:
        # Create initial daily score
        new_daily_score = 0
        new_daily_streak = 0
        new_questions_answered = 1
        new_daily_correct = 1 if is_correct else 0
    else:
        new_questions_answered = daily_score.questions_answered + 1
        new_daily_correct = daily_score.correct_answers + (1 if is_correct else 0)
        
        if is_correct:
            new_daily_streak = daily_score.daily_streak + 1
            daily_score_increase = calculate_score_for_correct_answer(daily_score.daily_streak)
            new_daily_score = daily_score.daily_score + daily_score_increase
        else:
            new_daily_streak = 0
            new_daily_score = daily_score.daily_score
    
    # Update daily score
    updated_daily_score = await DailyScoreRepository.upsert(
        current_user.id,
        current_user.email,
        current_user.full_name or current_user.email,
        today,
        DailyScoreUpdate(
            daily_score=new_daily_score,
            daily_streak=new_daily_streak,
            questions_answered=new_questions_answered,
            correct_answers=new_daily_correct
        )
    )
    
    return QuizSubmissionResponse(
        is_correct=is_correct,
        correct_option_id=correct_option.id,
        explanation=None,  # Could be added later
        score=updated_user_score.score,
        streak=updated_user_score.streak,
        daily_score=updated_daily_score.daily_score,
        daily_streak=updated_daily_score.daily_streak
    )


def create_title_with_blank(title: str) -> str:
    """
    Create a title with a blank (____) by replacing a key word.
    This is a simple implementation that looks for common chemistry terms.
    """
    # Common chemistry terms to replace with blanks
    chemistry_terms = [
        "hydrogen", "oxygen", "carbon", "nitrogen", "sodium", "chlorine",
        "water", "acid", "base", "salt", "oxide", "hydroxide", "carbonate",
        "electron", "proton", "neutron", "atom", "molecule", "compound",
        "reaction", "catalyst", "solution", "solvent", "solute"
    ]
    
    title_lower = title.lower()
    
    # Find the first chemistry term in the title
    for term in chemistry_terms:
        if term in title_lower:
            # Replace the term with blank (case-insensitive)
            import re
            pattern = re.compile(re.escape(term), re.IGNORECASE)
            return pattern.sub("____", title, count=1)
    
    # If no chemistry terms found, replace the last word
    words = title.split()
    if len(words) > 1:
        words[-1] = "____"
        return " ".join(words)
    
    return title