#!/usr/bin/env python3
"""
Database Setup Script
This script runs both index creation and admin user creation
Use this for initial database setup
"""

import logging
import subprocess
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_script(script_name: str) -> bool:
    """Run a Python script and return success status"""
    script_path = Path(__file__).parent / script_name
    
    if not script_path.exists():
        logger.error(f"Script not found: {script_path}")
        return False
    
    logger.info(f"Running {script_name}...")
    
    try:
        result = subprocess.run([sys.executable, str(script_path)], 
                              capture_output=True, text=True, check=False)
        
        if result.returncode == 0:
            logger.info(f"✅ {script_name} completed successfully")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            logger.error(f"❌ {script_name} failed with return code {result.returncode}")
            if result.stderr:
                print(f"Error output: {result.stderr}")
            if result.stdout:
                print(f"Standard output: {result.stdout}")
            return False
            
    except Exception as e:
        logger.error(f"Error running {script_name}: {e}")
        return False

def main():
    """Main function"""
    logger.info("=== Chemouflage Card Shop - Database Setup ===")
    
    # Run index creation first
    logger.info("Step 1: Creating database indexes...")
    if not run_script("create_indexes.py"):
        logger.error("Index creation failed. Aborting setup.")
        sys.exit(1)
    
    # Run admin user creation
    logger.info("Step 2: Creating admin user...")
    if not run_script("create_admin_user.py"):
        logger.error("Admin user creation failed. Setup incomplete.")
        sys.exit(1)
    
    logger.info("🎉 Database setup completed successfully!")
    logger.info("Your Chemouflage Card Shop database is ready to use.")

if __name__ == "__main__":
    main()
