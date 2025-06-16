@echo off
echo Starting Chemouflage Backend Setup

echo Setting up the database...
python create_indexes.py
python create_admin_user.py
python create_default_settings.py

echo Backend setup complete!
