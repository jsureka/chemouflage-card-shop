#!/bin/bash
echo "Starting Chemouflage Backend Setup"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python is not installed. Please install Python 3.8+"
    exit 1
fi

echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing requirements..."
pip install -r requirements.txt

echo "Setting up the database..."
python create_indexes.py
python create_admin_user.py

echo "Would you like to populate the database with sample data? (y/n)"
read -r populate_db
if [[ $populate_db == "y" || $populate_db == "Y" ]]; then
    echo "Creating sample data..."
    python create_sample_data.py
fi

echo "Starting the server..."
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

echo "Backend setup complete!"
