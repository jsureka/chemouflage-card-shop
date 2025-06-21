#!/usr/bin/env python3
"""
Sample Quiz Data Creation Script
Creates sample topics and questions for testing the quiz system
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent))

from app.db.mongodb import connect_to_mongo, get_database
from app.models.quiz import (
    DifficultyLevel,
    QuestionCreate,
    QuestionOptionCreate,
    QuestionType,
    TopicCreate,
)
from app.repositories.quiz_question import QuestionRepository
from app.repositories.quiz_topic import TopicRepository

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def create_sample_topics():
    """Create sample quiz topics"""
    topics_data = [
        {
            "name": "Programming Fundamentals",
            "description": "Basic programming concepts and principles"
        },
        {
            "name": "Web Development",
            "description": "Frontend and backend web development topics"
        },
        {
            "name": "Database Management",
            "description": "Database design, SQL, and data management"
        },
        {
            "name": "Data Structures & Algorithms",
            "description": "Common data structures and algorithmic problems"
        },
        {
            "name": "System Design",
            "description": "Large-scale system architecture and design patterns"
        }
    ]
    
    created_topics = []
    for topic_data in topics_data:
        try:
            # Check if topic already exists
            existing_topic = await TopicRepository.get_by_name(topic_data["name"])
            if existing_topic:
                logger.info(f"Topic '{topic_data['name']}' already exists")
                created_topics.append(existing_topic)
                continue
            
            topic_create = TopicCreate(**topic_data)
            topic_id = await TopicRepository.create(topic_create)
            topic = await TopicRepository.get_by_id(topic_id)
            created_topics.append(topic)
            logger.info(f"Created topic: {topic.name}")
        except Exception as e:
            logger.error(f"Failed to create topic '{topic_data['name']}': {e}")
    
    return created_topics


async def create_sample_questions(topics):
    """Create sample questions for each topic"""
    
    # Programming Fundamentals Questions
    programming_topic = next((t for t in topics if t.name == "Programming Fundamentals"), None)
    if programming_topic:
        questions = [
            {
                "topic_id": programming_topic.id,
                "title": "What is a variable in programming?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="A container for storing data values", is_correct=True),
                    QuestionOptionCreate(title="A function that performs calculations", is_correct=False),
                    QuestionOptionCreate(title="A loop structure", is_correct=False),
                    QuestionOptionCreate(title="A conditional statement", is_correct=False)
                ]
            },
            {
                "topic_id": programming_topic.id,
                "title": "Explain the concept of Object-Oriented Programming (OOP) and its main principles.",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.DESCRIPTIVE
            },
            {
                "topic_id": programming_topic.id,
                "title": "What does 'DRY' principle stand for?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.SHORT_ANSWER
            }
        ]
        await create_questions_for_topic(questions)
    
    # Web Development Questions
    web_topic = next((t for t in topics if t.name == "Web Development"), None)
    if web_topic:
        questions = [
            {
                "topic_id": web_topic.id,
                "title": "Which of the following is NOT a valid HTTP method?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="GET", is_correct=False),
                    QuestionOptionCreate(title="POST", is_correct=False),
                    QuestionOptionCreate(title="FETCH", is_correct=True),
                    QuestionOptionCreate(title="DELETE", is_correct=False),
                    QuestionOptionCreate(title="PUT", is_correct=False)
                ]
            },
            {
                "topic_id": web_topic.id,
                "title": "Explain the difference between client-side and server-side rendering.",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.DESCRIPTIVE
            },
            {
                "topic_id": web_topic.id,
                "title": "What does CSS stand for?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.SHORT_ANSWER
            },
            {
                "topic_id": web_topic.id,
                "title": "Which CSS property is used to change the text color?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="font-color", is_correct=False),
                    QuestionOptionCreate(title="text-color", is_correct=False),
                    QuestionOptionCreate(title="color", is_correct=True),
                    QuestionOptionCreate(title="background-color", is_correct=False)
                ]
            }
        ]
        await create_questions_for_topic(questions)
    
    # Database Management Questions
    db_topic = next((t for t in topics if t.name == "Database Management"), None)
    if db_topic:
        questions = [
            {
                "topic_id": db_topic.id,
                "title": "What does SQL stand for?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.SHORT_ANSWER
            },
            {
                "topic_id": db_topic.id,
                "title": "Which of the following is NOT a type of database relationship?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="One-to-One", is_correct=False),
                    QuestionOptionCreate(title="One-to-Many", is_correct=False),
                    QuestionOptionCreate(title="Many-to-Many", is_correct=False),
                    QuestionOptionCreate(title="All-to-All", is_correct=True)
                ]
            },
            {
                "topic_id": db_topic.id,
                "title": "Explain database normalization and why it's important.",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.DESCRIPTIVE
            }
        ]
        await create_questions_for_topic(questions)
    
    # Data Structures & Algorithms Questions
    dsa_topic = next((t for t in topics if t.name == "Data Structures & Algorithms"), None)
    if dsa_topic:
        questions = [
            {
                "topic_id": dsa_topic.id,
                "title": "What is the time complexity of binary search?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="O(n)", is_correct=False),
                    QuestionOptionCreate(title="O(log n)", is_correct=True),
                    QuestionOptionCreate(title="O(n²)", is_correct=False),
                    QuestionOptionCreate(title="O(1)", is_correct=False)
                ]
            },
            {
                "topic_id": dsa_topic.id,
                "title": "Which data structure follows Last In First Out (LIFO) principle?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.SHORT_ANSWER
            },
            {
                "topic_id": dsa_topic.id,
                "title": "Explain the difference between Depth-First Search (DFS) and Breadth-First Search (BFS) algorithms.",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.DESCRIPTIVE
            }
        ]
        await create_questions_for_topic(questions)
    
    # System Design Questions
    system_topic = next((t for t in topics if t.name == "System Design"), None)
    if system_topic:
        questions = [
            {
                "topic_id": system_topic.id,
                "title": "What is load balancing in system design?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.DESCRIPTIVE
            },
            {
                "topic_id": system_topic.id,
                "title": "Which of the following is NOT a type of database scaling?",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Horizontal Scaling", is_correct=False),
                    QuestionOptionCreate(title="Vertical Scaling", is_correct=False),
                    QuestionOptionCreate(title="Diagonal Scaling", is_correct=True),
                    QuestionOptionCreate(title="Sharding", is_correct=False)
                ]
            },
            {
                "topic_id": system_topic.id,
                "title": "What does CAP theorem stand for?",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.SHORT_ANSWER
            }
        ]
        await create_questions_for_topic(questions)


async def create_questions_for_topic(questions):
    """Helper function to create questions"""
    for question_data in questions:
        try:
            question_create = QuestionCreate(**question_data)
            question_id = await QuestionRepository.create(question_create)
            question = await QuestionRepository.get_by_id(question_id)
            logger.info(f"Created question: {question.title[:50]}...")
        except Exception as e:
            logger.error(f"Failed to create question: {e}")


async def main():
    """Main function to create sample quiz data"""
    try:
        # Connect to database
        await connect_to_mongo()
        logger.info("Connected to database")
        
        # Create sample topics
        logger.info("Creating sample topics...")
        topics = await create_sample_topics()
        
        # Create sample questions
        logger.info("Creating sample questions...")
        await create_sample_questions(topics)
        
        logger.info("Sample quiz data creation completed successfully!")
        
    except Exception as e:
        logger.error(f"Failed to create sample quiz data: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
