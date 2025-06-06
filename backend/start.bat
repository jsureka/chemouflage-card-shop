@echo off
echo Starting Chemouflage Backend Setup

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8+
    goto :eof
)

echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt

echo Setting up the database...
python create_indexes.py
python create_admin_user.py

echo Would you like to populate the database with sample data? (y/n)
set /p populate_db=
if /i "%populate_db%"=="y" (
    echo Creating sample data...
    python create_sample_data.py
)

echo Starting the server...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

echo Backend setup complete!
