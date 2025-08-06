#!/usr/bin/env python3
"""
Chemistry Quiz Data Creation Script
Creates comprehensive chemistry topics and questions for the reaction quiz game
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


async def create_chemistry_topics():
    """Create chemistry quiz topics"""
    topics_data = [
        {
            "name": "Periodic Table",
            "description": "Elements, properties, and periodic trends"
        },
        {
            "name": "Chemical Bonding",
            "description": "Ionic, covalent, and metallic bonds"
        },
        {
            "name": "Acids and Bases",
            "description": "pH, neutralization, and acid-base reactions"
        },
        {
            "name": "Organic Chemistry",
            "description": "Carbon compounds, functional groups, and reactions"
        },
        {
            "name": "Chemical Reactions",
            "description": "Types of reactions, balancing equations, and stoichiometry"
        },
        {
            "name": "Atomic Structure",
            "description": "Electrons, protons, neutrons, and electron configuration"
        },
        {
            "name": "States of Matter",
            "description": "Solids, liquids, gases, and phase transitions"
        },
        {
            "name": "Solutions and Mixtures",
            "description": "Concentration, solubility, and solution properties"
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


async def create_chemistry_questions(topics):
    """Create comprehensive chemistry questions for each topic"""
    
    questions_data = []
    
    # Periodic Table Questions
    periodic_topic = next((t for t in topics if t.name == "Periodic Table"), None)
    if periodic_topic:
        questions_data.extend([
            {
                "topic_id": periodic_topic.id,
                "title": "Which element has the chemical symbol H?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Hydrogen", is_correct=True),
                    QuestionOptionCreate(title="Helium", is_correct=False),
                    QuestionOptionCreate(title="Hafnium", is_correct=False),
                    QuestionOptionCreate(title="Holmium", is_correct=False)
                ]
            },
            {
                "topic_id": periodic_topic.id,
                "title": "What is the atomic number of carbon?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="6", is_correct=True),
                    QuestionOptionCreate(title="12", is_correct=False),
                    QuestionOptionCreate(title="8", is_correct=False),
                    QuestionOptionCreate(title="4", is_correct=False)
                ]
            },
            {
                "topic_id": periodic_topic.id,
                "title": "Which gas makes up about 78% of Earth's atmosphere?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Nitrogen", is_correct=True),
                    QuestionOptionCreate(title="Oxygen", is_correct=False),
                    QuestionOptionCreate(title="Carbon Dioxide", is_correct=False),
                    QuestionOptionCreate(title="Argon", is_correct=False)
                ]
            },
            {
                "topic_id": periodic_topic.id,
                "title": "What is the most abundant element in the universe?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Hydrogen", is_correct=True),
                    QuestionOptionCreate(title="Helium", is_correct=False),
                    QuestionOptionCreate(title="Oxygen", is_correct=False),
                    QuestionOptionCreate(title="Carbon", is_correct=False)
                ]
            },
            {
                "topic_id": periodic_topic.id,
                "title": "Which element is known as the 'King of Chemicals'?",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Sulfuric Acid (contains Sulfur)", is_correct=True),
                    QuestionOptionCreate(title="Hydrochloric Acid (contains Chlorine)", is_correct=False),
                    QuestionOptionCreate(title="Nitric Acid (contains Nitrogen)", is_correct=False),
                    QuestionOptionCreate(title="Phosphoric Acid (contains Phosphorus)", is_correct=False)
                ]
            }
        ])
    
    # Chemical Bonding Questions
    bonding_topic = next((t for t in topics if t.name == "Chemical Bonding"), None)
    if bonding_topic:
        questions_data.extend([
            {
                "topic_id": bonding_topic.id,
                "title": "What type of bond forms between sodium and chlorine in table salt?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Ionic bond", is_correct=True),
                    QuestionOptionCreate(title="Covalent bond", is_correct=False),
                    QuestionOptionCreate(title="Metallic bond", is_correct=False),
                    QuestionOptionCreate(title="Hydrogen bond", is_correct=False)
                ]
            },
            {
                "topic_id": bonding_topic.id,
                "title": "Water molecules are held together by which type of bonds?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Covalent bonds", is_correct=True),
                    QuestionOptionCreate(title="Ionic bonds", is_correct=False),
                    QuestionOptionCreate(title="Metallic bonds", is_correct=False),
                    QuestionOptionCreate(title="Van der Waals forces", is_correct=False)
                ]
            },
            {
                "topic_id": bonding_topic.id,
                "title": "Which type of bond involves the sharing of electrons?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Covalent bond", is_correct=True),
                    QuestionOptionCreate(title="Ionic bond", is_correct=False),
                    QuestionOptionCreate(title="Metallic bond", is_correct=False),
                    QuestionOptionCreate(title="Coordinate bond", is_correct=False)
                ]
            },
            {
                "topic_id": bonding_topic.id,
                "title": "What is the maximum number of covalent bonds carbon can form?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="4", is_correct=True),
                    QuestionOptionCreate(title="2", is_correct=False),
                    QuestionOptionCreate(title="6", is_correct=False),
                    QuestionOptionCreate(title="8", is_correct=False)
                ]
            }
        ])
    
    # Acids and Bases Questions
    acids_bases_topic = next((t for t in topics if t.name == "Acids and Bases"), None)
    if acids_bases_topic:
        questions_data.extend([
            {
                "topic_id": acids_bases_topic.id,
                "title": "What is the pH of pure water at 25°C?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="7", is_correct=True),
                    QuestionOptionCreate(title="0", is_correct=False),
                    QuestionOptionCreate(title="14", is_correct=False),
                    QuestionOptionCreate(title="1", is_correct=False)
                ]
            },
            {
                "topic_id": acids_bases_topic.id,
                "title": "Which substance turns blue litmus paper red?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Acid", is_correct=True),
                    QuestionOptionCreate(title="Base", is_correct=False),
                    QuestionOptionCreate(title="Salt", is_correct=False),
                    QuestionOptionCreate(title="Water", is_correct=False)
                ]
            },
            {
                "topic_id": acids_bases_topic.id,
                "title": "What is the common name for sodium hydroxide?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Caustic soda", is_correct=True),
                    QuestionOptionCreate(title="Baking soda", is_correct=False),
                    QuestionOptionCreate(title="Washing soda", is_correct=False),
                    QuestionOptionCreate(title="Soda ash", is_correct=False)
                ]
            },
            {
                "topic_id": acids_bases_topic.id,
                "title": "Which acid is present in vinegar?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Acetic acid", is_correct=True),
                    QuestionOptionCreate(title="Citric acid", is_correct=False),
                    QuestionOptionCreate(title="Lactic acid", is_correct=False),
                    QuestionOptionCreate(title="Formic acid", is_correct=False)
                ]
            }
        ])
    
    # Organic Chemistry Questions
    organic_topic = next((t for t in topics if t.name == "Organic Chemistry"), None)
    if organic_topic:
        questions_data.extend([
            {
                "topic_id": organic_topic.id,
                "title": "What is the simplest hydrocarbon?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Methane", is_correct=True),
                    QuestionOptionCreate(title="Ethane", is_correct=False),
                    QuestionOptionCreate(title="Propane", is_correct=False),
                    QuestionOptionCreate(title="Butane", is_correct=False)
                ]
            },
            {
                "topic_id": organic_topic.id,
                "title": "Which functional group is present in alcohols?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="-OH (Hydroxyl)", is_correct=True),
                    QuestionOptionCreate(title="-COOH (Carboxyl)", is_correct=False),
                    QuestionOptionCreate(title="-CHO (Aldehyde)", is_correct=False),
                    QuestionOptionCreate(title="-NH2 (Amino)", is_correct=False)
                ]
            },
            {
                "topic_id": organic_topic.id,
                "title": "What is the molecular formula of glucose?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="C6H12O6", is_correct=True),
                    QuestionOptionCreate(title="C12H22O11", is_correct=False),
                    QuestionOptionCreate(title="C6H6", is_correct=False),
                    QuestionOptionCreate(title="C2H6O", is_correct=False)
                ]
            },
            {
                "topic_id": organic_topic.id,
                "title": "Which polymer is formed from the monomer ethene?",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Polyethylene", is_correct=True),
                    QuestionOptionCreate(title="Polystyrene", is_correct=False),
                    QuestionOptionCreate(title="PVC", is_correct=False),
                    QuestionOptionCreate(title="Nylon", is_correct=False)
                ]
            }
        ])
    
    # Chemical Reactions Questions
    reactions_topic = next((t for t in topics if t.name == "Chemical Reactions"), None)
    if reactions_topic:
        questions_data.extend([
            {
                "topic_id": reactions_topic.id,
                "title": "In the reaction 2H2 + O2 → 2H2O, what is produced?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Water", is_correct=True),
                    QuestionOptionCreate(title="Hydrogen peroxide", is_correct=False),
                    QuestionOptionCreate(title="Hydroxide", is_correct=False),
                    QuestionOptionCreate(title="Hydronium", is_correct=False)
                ]
            },
            {
                "topic_id": reactions_topic.id,
                "title": "What type of reaction is photosynthesis?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Endothermic", is_correct=True),
                    QuestionOptionCreate(title="Exothermic", is_correct=False),
                    QuestionOptionCreate(title="Neutral", is_correct=False),
                    QuestionOptionCreate(title="Isothermic", is_correct=False)
                ]
            },
            {
                "topic_id": reactions_topic.id,
                "title": "What happens to the total mass in a chemical reaction?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Remains constant", is_correct=True),
                    QuestionOptionCreate(title="Increases", is_correct=False),
                    QuestionOptionCreate(title="Decreases", is_correct=False),
                    QuestionOptionCreate(title="Depends on the reaction", is_correct=False)
                ]
            },
            {
                "topic_id": reactions_topic.id,
                "title": "A substance that speeds up a reaction without being consumed is called a:",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Catalyst", is_correct=True),
                    QuestionOptionCreate(title="Reactant", is_correct=False),
                    QuestionOptionCreate(title="Product", is_correct=False),
                    QuestionOptionCreate(title="Solvent", is_correct=False)
                ]
            }
        ])
    
    # Atomic Structure Questions
    atomic_topic = next((t for t in topics if t.name == "Atomic Structure"), None)
    if atomic_topic:
        questions_data.extend([
            {
                "topic_id": atomic_topic.id,
                "title": "Which particle has a positive charge?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Proton", is_correct=True),
                    QuestionOptionCreate(title="Electron", is_correct=False),
                    QuestionOptionCreate(title="Neutron", is_correct=False),
                    QuestionOptionCreate(title="Photon", is_correct=False)
                ]
            },
            {
                "topic_id": atomic_topic.id,
                "title": "Where are electrons located in an atom?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="In orbitals around the nucleus", is_correct=True),
                    QuestionOptionCreate(title="In the nucleus", is_correct=False),
                    QuestionOptionCreate(title="Between atoms", is_correct=False),
                    QuestionOptionCreate(title="In the proton cloud", is_correct=False)
                ]
            },
            {
                "topic_id": atomic_topic.id,
                "title": "What determines the atomic number of an element?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Number of protons", is_correct=True),
                    QuestionOptionCreate(title="Number of neutrons", is_correct=False),
                    QuestionOptionCreate(title="Number of electrons", is_correct=False),
                    QuestionOptionCreate(title="Atomic mass", is_correct=False)
                ]
            },
            {
                "topic_id": atomic_topic.id,
                "title": "What is the maximum number of electrons that can occupy the first electron shell?",
                "difficulty": DifficultyLevel.HARD,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="2", is_correct=True),
                    QuestionOptionCreate(title="8", is_correct=False),
                    QuestionOptionCreate(title="18", is_correct=False),
                    QuestionOptionCreate(title="32", is_correct=False)
                ]
            }
        ])
    
    # States of Matter Questions
    states_topic = next((t for t in topics if t.name == "States of Matter"), None)
    if states_topic:
        questions_data.extend([
            {
                "topic_id": states_topic.id,
                "title": "At what temperature does water freeze at standard pressure?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="0°C", is_correct=True),
                    QuestionOptionCreate(title="100°C", is_correct=False),
                    QuestionOptionCreate(title="-273°C", is_correct=False),
                    QuestionOptionCreate(title="32°C", is_correct=False)
                ]
            },
            {
                "topic_id": states_topic.id,
                "title": "What is the process called when a gas turns directly into a solid?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Deposition", is_correct=True),
                    QuestionOptionCreate(title="Sublimation", is_correct=False),
                    QuestionOptionCreate(title="Condensation", is_correct=False),
                    QuestionOptionCreate(title="Crystallization", is_correct=False)
                ]
            },
            {
                "topic_id": states_topic.id,
                "title": "Which state of matter has particles with the most kinetic energy?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Gas", is_correct=True),
                    QuestionOptionCreate(title="Liquid", is_correct=False),
                    QuestionOptionCreate(title="Solid", is_correct=False),
                    QuestionOptionCreate(title="Plasma", is_correct=False)
                ]
            }
        ])
    
    # Solutions and Mixtures Questions
    solutions_topic = next((t for t in topics if t.name == "Solutions and Mixtures"), None)
    if solutions_topic:
        questions_data.extend([
            {
                "topic_id": solutions_topic.id,
                "title": "In a solution, the substance that dissolves is called the:",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Solute", is_correct=True),
                    QuestionOptionCreate(title="Solvent", is_correct=False),
                    QuestionOptionCreate(title="Solution", is_correct=False),
                    QuestionOptionCreate(title="Suspension", is_correct=False)
                ]
            },
            {
                "topic_id": solutions_topic.id,
                "title": "What is the universal solvent?",
                "difficulty": DifficultyLevel.EASY,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Water", is_correct=True),
                    QuestionOptionCreate(title="Alcohol", is_correct=False),
                    QuestionOptionCreate(title="Acetone", is_correct=False),
                    QuestionOptionCreate(title="Oil", is_correct=False)
                ]
            },
            {
                "topic_id": solutions_topic.id,
                "title": "What happens to the solubility of most solids when temperature increases?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Increases", is_correct=True),
                    QuestionOptionCreate(title="Decreases", is_correct=False),
                    QuestionOptionCreate(title="Remains the same", is_correct=False),
                    QuestionOptionCreate(title="Becomes zero", is_correct=False)
                ]
            },
            {
                "topic_id": solutions_topic.id,
                "title": "Which separation technique is used to separate a mixture of sand and salt?",
                "difficulty": DifficultyLevel.MEDIUM,
                "question_type": QuestionType.MULTIPLE_CHOICE,
                "options": [
                    QuestionOptionCreate(title="Dissolution and filtration", is_correct=True),
                    QuestionOptionCreate(title="Distillation", is_correct=False),
                    QuestionOptionCreate(title="Chromatography", is_correct=False),
                    QuestionOptionCreate(title="Magnetic separation", is_correct=False)
                ]
            }
        ])
    
    # Create all questions
    created_count = 0
    for question_data in questions_data:
        try:
            question_id = await QuestionRepository.create(QuestionCreate(**question_data))
            created_count += 1
            logger.info(f"Created question {created_count}: {question_data['title'][:50]}...")
        except Exception as e:
            logger.error(f"Failed to create question '{question_data['title'][:50]}...': {e}")
    
    logger.info(f"Successfully created {created_count} chemistry questions")
    return created_count


async def main():
    """Main function to create chemistry quiz data"""
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        logger.info("Connected to MongoDB")
        
        # Create chemistry topics
        logger.info("Creating chemistry topics...")
        topics = await create_chemistry_topics()
        logger.info(f"Created/found {len(topics)} topics")
        
        # Create chemistry questions
        logger.info("Creating chemistry questions...")
        question_count = await create_chemistry_questions(topics)
        logger.info(f"Chemistry quiz data creation completed!")
        logger.info(f"Total topics: {len(topics)}")
        logger.info(f"Total questions created: {question_count}")
        
    except Exception as e:
        logger.error(f"Error creating chemistry quiz data: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
