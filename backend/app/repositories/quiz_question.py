from datetime import datetime
from typing import List, Optional

from bson import ObjectId

from app.db.mongodb import get_database
from app.models.quiz import (
    DifficultyLevel,
    Question,
    QuestionCreate,
    QuestionForUser,
    QuestionInDB,
    QuestionOption,
    QuestionOptionCreate,
    QuestionType,
    QuestionUpdate,
    QuestionWithOptions,
)
from app.services.cache import (
    cache_invalidate,
    cache_invalidate_patterns,
    cache_service,
    cached,
)


class QuestionRepository:
    
    @staticmethod
    @cache_invalidate_patterns("quiz_question:*", "quiz_topic:*", "quiz_stats:*")
    async def create(question: QuestionCreate) -> str:
        """Create a new question with options"""
        db = await get_database()
        
        # Prepare question data
        question_doc = question.model_dump(exclude={"options"})
        question_doc["created_at"] = datetime.utcnow()
        
        # Insert question
        result = await db.quiz_questions.insert_one(question_doc)
        question_id = str(result.inserted_id)
        
        # If multiple choice, insert options
        if question.question_type == QuestionType.MULTIPLE_CHOICE and question.options:
            options_docs = []
            for option in question.options:
                option_doc = option.model_dump()
                option_doc["question_id"] = question_id
                option_doc["created_at"] = datetime.utcnow()
                options_docs.append(option_doc)
            
            await db.quiz_question_options.insert_many(options_docs)
        
        return question_id

    @staticmethod
    @cached("quiz_question:{question_id}:{include_options}", ttl=300)
    async def get_by_id(question_id: str, include_options: bool = True) -> Optional[Question]:
        """Get question by ID with or without options"""
        db = await get_database()
        
        # Get question
        question_doc = await db.quiz_questions.find_one({"_id": ObjectId(question_id)})
        if not question_doc:
            return None
        
        question_data = {**question_doc, "id": str(question_doc["_id"])}
        
        # Get topic name
        topic_doc = await db.quiz_topics.find_one({"_id": ObjectId(question_doc["topic_id"])})
        if topic_doc:
            question_data["topic_name"] = topic_doc["name"]
        
        # Get options if multiple choice and requested
        if include_options and question_doc["question_type"] == QuestionType.MULTIPLE_CHOICE:
            options_cursor = db.quiz_question_options.find({"question_id": question_id})
            options = []
            async for option_doc in options_cursor:
                option_data = {**option_doc, "id": str(option_doc["_id"])}
                options.append(QuestionOption(**option_data))
            question_data["options"] = options
        
        return Question(**question_data)

    @staticmethod
    async def get_for_user(question_id: str) -> Optional[QuestionForUser]:
        """Get question for regular users (without correct answers)"""
        question = await QuestionRepository.get_by_id(question_id)
        if not question:
            return None

        get = lambda k: question[k] if isinstance(question, dict) else getattr(question, k)
        user_question_data = {
            "id": get("id"),
            "topic_id": get("topic_id"),
            "title": get("title"),
            "image_url": get("image_url"),
            "difficulty": get("difficulty"),
            "question_type": get("question_type"),
            "topic_name": get("topic_name"),
        }

        # Always fetch options from DB if missing
        options = get("options")
        if not options and get("question_type") == QuestionType.MULTIPLE_CHOICE:
            db = await get_database()
            options_cursor = db.quiz_question_options.find({"question_id": question_id})
            options = []
            async for option_doc in options_cursor:
                option_data = {**option_doc, "id": str(option_doc["_id"])}
                options.append(option_data)

        if options:
            user_options = []
            for option in options:
                get_opt = lambda k: option[k] if isinstance(option, dict) else getattr(option, k)
                user_option = {
                    "id": get_opt("id"),
                    "title": get_opt("title"),
                    "image_url": get_opt("image_url"),
                }
                user_options.append(user_option)
            user_question_data["options"] = user_options

        return QuestionForUser(**user_question_data)

    @staticmethod
    @cached("quiz_question:list:{skip}:{limit}:{topic_id}:{difficulty}:{question_type}:{active_only}:{search}:{include_options}", ttl=300)
    async def get_all(
        skip: int = 0,
        limit: int = 100,
        topic_id: Optional[str] = None,
        difficulty: Optional[DifficultyLevel] = None,
        question_type: Optional[QuestionType] = None,
        active_only: bool = False,
        search: Optional[str] = None,
        include_options: bool = True
    ) -> List[Question]:
        """Get all questions with filtering and pagination"""
        db = await get_database()
        
        # Build query filter
        query_filter = {}
        if topic_id:
            query_filter["topic_id"] = topic_id
        if difficulty:
            query_filter["difficulty"] = difficulty
        if question_type:
            query_filter["question_type"] = question_type
        if active_only:
            query_filter["is_active"] = True
        if search:
            query_filter["title"] = {"$regex": search, "$options": "i"}
        
        # Use simple find with indexes instead of aggregation lookups
        cursor = db.quiz_questions.find(query_filter).skip(skip).limit(limit).sort("created_at", -1)
        questions = []
        
        # Cache topic names to avoid multiple lookups
        topic_cache = {}
        
        async for question_doc in cursor:
            question_data = {**question_doc, "id": str(question_doc["_id"])}
            
            # Get topic name from cache or database
            if question_doc["topic_id"] not in topic_cache:
                topic_doc_lookup = await db.quiz_topics.find_one(
                    {"_id": ObjectId(question_doc["topic_id"])}, 
                    {"name": 1}
                )
                if topic_doc_lookup:
                    topic_cache[question_doc["topic_id"]] = topic_doc_lookup["name"]
                else:
                    topic_cache[question_doc["topic_id"]] = None
            
            question_data["topic_name"] = topic_cache[question_doc["topic_id"]]
            
            # Get options if multiple choice and requested
            if include_options and question_doc["question_type"] == QuestionType.MULTIPLE_CHOICE:
                options_cursor = db.quiz_question_options.find({"question_id": str(question_doc["_id"])})
                options = []
                async for option_doc in options_cursor:
                    option_data = {**option_doc, "id": str(option_doc["_id"])}
                    options.append(QuestionOption(**option_data))
                question_data["options"] = options
            
            questions.append(Question(**question_data))
        
        return questions

    @staticmethod
    @cached("quiz_question:count:{topic_id}:{difficulty}:{question_type}:{active_only}:{search}", ttl=300)
    async def count(
        topic_id: Optional[str] = None,
        difficulty: Optional[DifficultyLevel] = None,
        question_type: Optional[QuestionType] = None,
        active_only: bool = False,
        search: Optional[str] = None
    ) -> int:
        """Count questions with filtering"""
        db = await get_database()
        
        query_filter = {}
        if topic_id:
            query_filter["topic_id"] = topic_id
        if difficulty:
            query_filter["difficulty"] = difficulty
        if question_type:
            query_filter["question_type"] = question_type
        if active_only:
            query_filter["is_active"] = True
        if search:
            query_filter["title"] = {"$regex": search, "$options": "i"}
        
        return await db.quiz_questions.count_documents(query_filter)

    @staticmethod
    @cache_invalidate_patterns("quiz_question:*", "quiz_topic:*", "quiz_stats:*")
    async def update(question_id: str, question_update: QuestionUpdate) -> Optional[Question]:
        """Update question and its options"""
        db = await get_database()
        
        # Update question
        update_data = {k: v for k, v in question_update.model_dump(exclude={"options"}).items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await db.quiz_questions.update_one(
                {"_id": ObjectId(question_id)},
                {"$set": update_data}
            )
        
        # Update options if provided
        if question_update.options is not None:
            # Delete existing options
            await db.quiz_question_options.delete_many({"question_id": question_id})
            
            # Insert new options
            if question_update.options:
                options_docs = []
                for option in question_update.options:
                    option_doc = option.model_dump()
                    option_doc["question_id"] = question_id
                    option_doc["created_at"] = datetime.utcnow()
                    options_docs.append(option_doc)
                
                await db.quiz_question_options.insert_many(options_docs)
        
        return await QuestionRepository.get_by_id(question_id)

    @staticmethod
    @cache_invalidate_patterns("quiz_question:*", "quiz_topic:*", "quiz_stats:*")
    async def delete(question_id: str) -> bool:
        """Delete question and its options"""
        db = await get_database()
        
        # Delete options first
        await db.quiz_question_options.delete_many({"question_id": question_id})
        
        # Delete question
        result = await db.quiz_questions.delete_one({"_id": ObjectId(question_id)})
        return result.deleted_count > 0

    @staticmethod
    async def get_questions_by_topic(topic_id: str, for_user: bool = False) -> List[Question]:
        """Get all questions for a specific topic"""
        if for_user:
            questions = await QuestionRepository.get_all(
                topic_id=topic_id,
                active_only=True,
                include_options=False
            )
            # Convert to user-safe format
            user_questions = []
            for question in questions:
                user_question = await QuestionRepository.get_for_user(question.id)
                if user_question:
                    user_questions.append(user_question)
            return user_questions
        else:
            return await QuestionRepository.get_all(topic_id=topic_id, active_only=True)

    @staticmethod
    @cached("quiz_question:random:{topic_id}:{difficulty}:{question_type}:{limit}", ttl=60)  # Short cache for randomness
    async def get_random_questions(
        topic_id: Optional[str] = None,
        difficulty: Optional[DifficultyLevel] = None,
        question_type: Optional[QuestionType] = None,
        limit: int = 10
    ) -> List[QuestionForUser]:
        """Get random questions for quiz"""
        db = await get_database()
        
        # Build pipeline for aggregation
        pipeline = [
            {"$match": {"is_active": True}}
        ]
        
        if topic_id:
            pipeline[0]["$match"]["topic_id"] = topic_id
        if difficulty:
            pipeline[0]["$match"]["difficulty"] = difficulty
        if question_type:
            pipeline[0]["$match"]["question_type"] = question_type
        
        pipeline.extend([
            {"$sample": {"size": limit}},
            {"$sort": {"created_at": -1}}
        ])
        
        # Execute aggregation
        cursor = db.quiz_questions.aggregate(pipeline)
        questions = []
        
        # Cache topic names to avoid multiple lookups
        topic_cache = {}
        
        async for question_doc in cursor:
            # Get topic name from cache or database
            topic_name = None
            if question_doc["topic_id"] not in topic_cache:
                topic_doc_lookup = await db.quiz_topics.find_one(
                    {"_id": ObjectId(question_doc["topic_id"])}, 
                    {"name": 1}
                )
                if topic_doc_lookup:
                    topic_cache[question_doc["topic_id"]] = topic_doc_lookup["name"]
                else:
                    topic_cache[question_doc["topic_id"]] = None
            
            topic_name = topic_cache[question_doc["topic_id"]]
            
            # Remove correct answer information for users
            user_question_data = {
                "id": str(question_doc["_id"]),
                "topic_id": question_doc["topic_id"],
                "title": question_doc["title"],
                "image_url": question_doc.get("image_url"),
                "difficulty": question_doc["difficulty"],
                "question_type": question_doc["question_type"],
                "topic_name": topic_name
            }
            
            # For multiple choice, get options without correct answers
            if question_doc["question_type"] == QuestionType.MULTIPLE_CHOICE:
                options_cursor = db.quiz_question_options.find(
                    {"question_id": str(question_doc["_id"])},
                    {"title": 1, "image_url": 1}  # Exclude is_correct
                )
                user_options = []
                async for option in options_cursor:
                    user_option = {
                        "id": str(option["_id"]),
                        "title": option["title"],
                        "image_url": option.get("image_url")
                    }
                    user_options.append(user_option)
                user_question_data["options"] = user_options
            
            questions.append(QuestionForUser(**user_question_data))
        
        return questions

    @staticmethod
    async def validate_multiple_choice_options(options: List[QuestionOptionCreate]) -> bool:
        """Validate multiple choice options"""
        if not options or len(options) < 2:
            return False
        
        if len(options) > 5:
            return False
        
        # Check if exactly one option is marked as correct
        correct_count = sum(1 for option in options if option.is_correct)
        return correct_count == 1
