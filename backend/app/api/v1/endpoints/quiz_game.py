from datetime import datetime
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
from app.models.quiz_session import (
    QuizSessionAnswer,
    QuizSessionAnswerRequest,
    QuizSessionCompleteResponse,
    QuizSessionCreate,
    QuizSessionResponse,
    QuizSessionStartRequest,
    QuizSessionStatus,
    QuizSessionUpdate,
)
from app.models.user import User
from app.repositories.quiz_question import QuestionRepository
from app.repositories.quiz_score import DailyScoreRepository, UserQuizScoreRepository
from app.repositories.quiz_session import QuizSessionRepository
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


@router.post("/start-session", response_model=QuizSessionResponse)
async def start_quiz_session(
    request: QuizSessionStartRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Start a new quiz session or resume an active one.
    Users can only have one quiz session per day.
    """
    # Check if user has already completed a quiz today
    if await QuizSessionRepository.has_completed_quiz_today(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already completed a quiz today. Come back tomorrow!"
        )
    
    # Check if user has an active session
    active_session = await QuizSessionRepository.get_active_session_for_user(current_user.id)
    if active_session:
        return QuizSessionResponse(**active_session.model_dump())
    
    # Get random questions for the new session
    questions = await QuestionRepository.get_random_questions(
        question_type=QuestionType.MULTIPLE_CHOICE,
        limit=request.question_count
    )
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No multiple choice questions available"
        )
    
    # Create new session
    question_ids = [q['id'] if isinstance(q, dict) else q.id for q in questions]
    session_create = QuizSessionCreate(
        user_id=current_user.id,
        question_ids=question_ids
    )
    
    session_id = await QuizSessionRepository.create(session_create)
    session = await QuizSessionRepository.get_by_id(session_id)
    
    return QuizSessionResponse(**session.model_dump())


@router.get("/session/{session_id}/question", response_model=dict)
async def get_current_question(
    session_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get the current question for an active quiz session.
    """
    session = await QuizSessionRepository.get_by_id(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found"
        )
    
    user_id = session['user_id'] if isinstance(session, dict) else session.user_id
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this quiz session"
        )

    status_val = session['status'] if isinstance(session, dict) else session.status
    if status_val != QuizSessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz session is not active"
        )

    current_question_index = session['current_question_index'] if isinstance(session, dict) else session.current_question_index
    question_ids = session['question_ids'] if isinstance(session, dict) else session.question_ids
    if current_question_index >= len(question_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz session is completed"
        )

    # Get current question
    current_question_id = question_ids[current_question_index]
    question = await QuestionRepository.get_by_id(current_question_id, include_options=False)

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )

    # Get options for user (without correct answer info)
    question_for_user = await QuestionRepository.get_for_user(current_question_id)
    if not question_for_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to prepare question for user"
        )
    # Debug logging for options
    import logging
    logging.warning(f"[DEBUG] question_for_user.options: {getattr(question_for_user, 'options', None)}")
    logging.warning(f"[DEBUG] question_for_user: {question_for_user}")

    # Shuffle options
    if question_for_user.options:
        shuffled_options = shuffle_options(question_for_user.options)
        user_safe_options = convert_options_for_reaction_game(shuffled_options)
    else:
        user_safe_options = []

    return {
        "id": question_for_user.id,
        "topic_id": question_for_user.topic_id,
        "title": question_for_user.title,
        "image_url": question_for_user.image_url,
        "difficulty": question_for_user.difficulty,
        "question_type": question_for_user.question_type,
        "options": user_safe_options,
        "topic_name": question_for_user.topic_name,
        "question_number": current_question_index + 1,
        "total_questions": len(question_ids),
        "session_id": session_id
    }


@router.post("/session/answer", response_model=dict)
async def submit_session_answer(
    request: QuizSessionAnswerRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Submit an answer for the current question in a quiz session.
    """
    session = await QuizSessionRepository.get_by_id(request.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found"
        )
    
    user_id = session['user_id'] if isinstance(session, dict) else session.user_id
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this quiz session"
        )
    
    status_val = session['status'] if isinstance(session, dict) else session.status
    if status_val != QuizSessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz session is not active"
        )
    
    # Verify question is current
    current_question_index = session['current_question_index'] if isinstance(session, dict) else session.current_question_index
    question_ids = session['question_ids'] if isinstance(session, dict) else session.question_ids
    if current_question_index >= len(question_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No more questions in this session"
        )
    
    current_question_id = question_ids[current_question_index]
    if current_question_id != request.question_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question ID does not match current session question"
        )
    
    # Get question with correct answers
    question = await QuestionRepository.get_by_id(request.question_id, include_options=True)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Find correct answer
    correct_option = None
    db_options = question['options'] if isinstance(question, dict) else question.options
    
    # Debug logging
    import logging
    logging.warning(f"[DEBUG] db_options: {db_options}")
    logging.warning(f"[DEBUG] question type: {type(question)}")
    
    for option in db_options or []:
        is_correct = option['is_correct'] if isinstance(option, dict) else option.is_correct
        logging.warning(f"[DEBUG] option: {option}, is_correct: {is_correct}")
        if is_correct:
            correct_option = option
            break
    
    if not correct_option:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Question has no correct answer"
        )
    
    correct_option_id = correct_option['id'] if isinstance(correct_option, dict) else correct_option.id
    is_correct = request.selected_option_id == correct_option_id
    
    # Create answer record
    answer = QuizSessionAnswer(
        question_id=request.question_id,
        selected_option_id=request.selected_option_id,
        is_correct=is_correct,
        answered_at=datetime.utcnow()
    )
    
    # Update session with answer and move to next question
    session_answers = session['answers'] if isinstance(session, dict) else session.answers
    session_current_index = session['current_question_index'] if isinstance(session, dict) else session.current_question_index
    session_question_ids = session['question_ids'] if isinstance(session, dict) else session.question_ids
    
    updated_answers = session_answers + [answer]
    new_question_index = session_current_index + 1
    
    await QuizSessionRepository.update(
        request.session_id,
        QuizSessionUpdate(
            current_question_index=new_question_index,
            answers=updated_answers
        )
    )
    
    is_session_complete = new_question_index >= len(session_question_ids)
    
    return {
        "is_correct": is_correct,
        "correct_option_id": correct_option_id,
        "question_completed": True,
        "session_complete": is_session_complete,
        "next_question_number": new_question_index + 1 if not is_session_complete else None,
        "total_questions": len(session_question_ids)
    }


@router.post("/session/{session_id}/complete", response_model=QuizSessionCompleteResponse)
async def complete_quiz_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Complete a quiz session and update user scores.
    """
    session = await QuizSessionRepository.get_by_id(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz session not found"
        )
    
    user_id = session['user_id'] if isinstance(session, dict) else session.user_id
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this quiz session"
        )
    
    status_val = session['status'] if isinstance(session, dict) else session.status
    if status_val != QuizSessionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz session is not active"
        )
    
    # Verify all questions are answered
    session_answers = session['answers'] if isinstance(session, dict) else session.answers
    session_question_ids = session['question_ids'] if isinstance(session, dict) else session.question_ids
    session_started_at = session['started_at'] if isinstance(session, dict) else session.started_at
    
    if len(session_answers) < len(session_question_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not all questions have been answered"
        )
    
    # Calculate total time
    session_duration = datetime.utcnow() - session_started_at
    total_time_seconds = int(session_duration.total_seconds())
    
    # Calculate results
    correct_answers = sum(1 for answer in session_answers if answer.is_correct)
    total_questions = len(session_question_ids)
    
    # Calculate consecutive correct streak within session
    max_streak = 0
    current_streak = 0
    for answer in session_answers:
        if answer.is_correct:
            current_streak += 1
            max_streak = max(max_streak, current_streak)
        else:
            current_streak = 0
    
    # Calculate score based on correct answers and streak
    base_score = correct_answers * 10
    streak_bonus = max_streak * 5 if max_streak >= 3 else 0
    total_score_earned = base_score + streak_bonus
    
    # Update user scores
    user_score = await UserQuizScoreRepository.get_by_user_id(current_user.id)
    if not user_score:
        user_score = await UserQuizScoreRepository.upsert(
            current_user.id,
            UserQuizScoreUpdate(score=0, streak=0, total_answered=0, correct_answers=0)
        )
    
    # Get current user stats
    user_total_answered = user_score['total_answered'] if isinstance(user_score, dict) else user_score.total_answered
    user_correct_answers = user_score['correct_answers'] if isinstance(user_score, dict) else user_score.correct_answers
    user_current_score = user_score['score'] if isinstance(user_score, dict) else user_score.score
    
    # Update user quiz score
    await UserQuizScoreRepository.upsert(
        current_user.id,
        UserQuizScoreUpdate(
            score=user_current_score + total_score_earned,
            streak=max_streak,  # Session streak becomes user streak
            total_answered=user_total_answered + total_questions,
            correct_answers=user_correct_answers + correct_answers
        )
    )
    
    # Update daily score
    today = get_today_date()
    daily_score = await DailyScoreRepository.get_by_user_and_date(current_user.id, today)
    
    if not daily_score:
        new_daily_score = total_score_earned
        new_daily_streak = max_streak
    else:
        daily_score_current = daily_score['daily_score'] if isinstance(daily_score, dict) else daily_score.daily_score
        new_daily_score = daily_score_current + total_score_earned
        new_daily_streak = max_streak  # Session streak becomes daily streak
    
    await DailyScoreRepository.upsert(
        current_user.id,
        current_user.email,
        current_user.full_name or current_user.email,
        today,
        DailyScoreUpdate(
            daily_score=new_daily_score,
            daily_streak=new_daily_streak,
            questions_answered=total_questions,
            correct_answers=correct_answers
        )
    )
    
    # Mark session as completed
    await QuizSessionRepository.update(
        session_id,
        QuizSessionUpdate(
            status=QuizSessionStatus.COMPLETED,
            completed_at=datetime.utcnow(),
            total_time_seconds=total_time_seconds
        )
    )
    
    return QuizSessionCompleteResponse(
        session_id=session_id,
        total_questions=total_questions,
        correct_answers=correct_answers,
        total_time_seconds=total_time_seconds,
        score_earned=total_score_earned,
        streak_achieved=max_streak,
        daily_score=new_daily_score,
        daily_streak=new_daily_streak
    )


@router.get("/session/status", response_model=dict)
async def get_quiz_session_status(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current quiz session status for the user.
    """
    # Check if user has completed quiz today
    has_completed_today = await QuizSessionRepository.has_completed_quiz_today(current_user.id)
    
    # Check for active session
    active_session = await QuizSessionRepository.get_active_session_for_user(current_user.id)
    
    return {
        "has_completed_today": has_completed_today,
        "has_active_session": active_session is not None,
        "active_session_id": active_session['id'] if active_session and isinstance(active_session, dict) else active_session.id if active_session else None,
        "current_question_index": active_session['current_question_index'] if active_session and isinstance(active_session, dict) else active_session.current_question_index if active_session else None,
        "total_questions": len(active_session['question_ids']) if active_session and isinstance(active_session, dict) else len(active_session.question_ids) if active_session else None
    }


@router.get("/reaction-questions", response_model=list)
async def get_reaction_questions(
    count: int = 10,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get multiple random multiple choice questions for reaction game.
    Returns questions with blank (____) in titles and shuffled options without is_correct.
    """
    # Get random multiple choice questions
    questions = await QuestionRepository.get_random_questions(
        question_type=QuestionType.MULTIPLE_CHOICE,
        limit=count
    )
    
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No multiple choice questions available"
        )
    
    result_questions = []
    
    for question in questions:
        # Use bracket notation for dicts
        options = question['options'] if isinstance(question, dict) else question.options
        if not options:
            continue  # Skip questions without options
        
        shuffled_options = shuffle_options(options)
        user_safe_options = convert_options_for_reaction_game(shuffled_options)

        result_questions.append({
            "id": question['id'] if isinstance(question, dict) else question.id,
            "topic_id": question['topic_id'] if isinstance(question, dict) else question.topic_id,
            "title": question['title'] if isinstance(question, dict) else question.title,
            "image_url": question.get('image_url') if isinstance(question, dict) else question.image_url,
            "difficulty": question['difficulty'] if isinstance(question, dict) else question.difficulty,
            "question_type": question['question_type'] if isinstance(question, dict) else question.question_type,
            "options": user_safe_options,
            "topic_name": question.get('topic_name') if isinstance(question, dict) else question.topic_name
        })
    
    return result_questions


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
    
    # Use bracket notation for dicts
    options = question['options'] if isinstance(question, dict) else question.options
    if not options:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Question has no options"
        )

    shuffled_options = shuffle_options(options)
    user_safe_options = convert_options_for_reaction_game(shuffled_options)

    return {
        "id": question['id'] if isinstance(question, dict) else question.id,
        "topic_id": question['topic_id'] if isinstance(question, dict) else question.topic_id,
        "title": question['title'] if isinstance(question, dict) else question.title,
        "image_url": question.get('image_url') if isinstance(question, dict) else question.image_url,
        "difficulty": question['difficulty'] if isinstance(question, dict) else question.difficulty,
        "question_type": question['question_type'] if isinstance(question, dict) else question.question_type,
        "options": user_safe_options,
        "topic_name": question.get('topic_name') if isinstance(question, dict) else question.topic_name
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
    
    # Use bracket notation for dicts
    db_options = db_question['options'] if isinstance(db_question, dict) else db_question.options
    for option in db_options or []:
        is_correct = option['is_correct'] if isinstance(option, dict) else option.is_correct
        option_id = option['id'] if isinstance(option, dict) else option.id
        
        if is_correct:
            correct_option = option
        if option_id == request.selected_option_id:
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
    correct_option_id = correct_option['id'] if isinstance(correct_option, dict) else correct_option.id
    is_correct = request.selected_option_id == correct_option_id
    
    # Get current user scores
    user_score = await UserQuizScoreRepository.get_by_user_id(current_user.id)
    if not user_score:
        # Create initial score
        user_score = await UserQuizScoreRepository.upsert(
            current_user.id,
            UserQuizScoreUpdate(score=0, streak=0, total_answered=0, correct_answers=0)
        )
    
    # Calculate new scores
    user_total_answered = user_score['total_answered'] if isinstance(user_score, dict) else user_score.total_answered
    user_correct_answers = user_score['correct_answers'] if isinstance(user_score, dict) else user_score.correct_answers
    user_streak = user_score['streak'] if isinstance(user_score, dict) else user_score.streak
    user_current_score = user_score['score'] if isinstance(user_score, dict) else user_score.score
    
    new_total_answered = user_total_answered + 1
    new_correct_answers = user_correct_answers + (1 if is_correct else 0)
    
    if is_correct:
        new_streak = user_streak + 1
        score_increase = calculate_score_for_correct_answer(user_streak)
        new_score = user_current_score + score_increase
    else:
        new_streak = 0
        new_score = user_current_score
    
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
        daily_questions_answered = daily_score['questions_answered'] if isinstance(daily_score, dict) else daily_score.questions_answered
        daily_correct_answers = daily_score['correct_answers'] if isinstance(daily_score, dict) else daily_score.correct_answers
        daily_streak_current = daily_score['daily_streak'] if isinstance(daily_score, dict) else daily_score.daily_streak
        daily_score_current = daily_score['daily_score'] if isinstance(daily_score, dict) else daily_score.daily_score
        
        new_questions_answered = daily_questions_answered + 1
        new_daily_correct = daily_correct_answers + (1 if is_correct else 0)
        
        if is_correct:
            new_daily_streak = daily_streak_current + 1
            daily_score_increase = calculate_score_for_correct_answer(daily_streak_current)
            new_daily_score = daily_score_current + daily_score_increase
        else:
            new_daily_streak = 0
            new_daily_score = daily_score_current
    
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
        correct_option_id=correct_option_id,
        explanation=None,  # Could be added later
        score=updated_user_score['score'] if isinstance(updated_user_score, dict) else updated_user_score.score,
        streak=updated_user_score['streak'] if isinstance(updated_user_score, dict) else updated_user_score.streak,
        daily_score=updated_daily_score['daily_score'] if isinstance(updated_daily_score, dict) else updated_daily_score.daily_score,
        daily_streak=updated_daily_score['daily_streak'] if isinstance(updated_daily_score, dict) else updated_daily_score.daily_streak
    )