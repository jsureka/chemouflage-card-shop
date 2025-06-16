#!/bin/bash
echo "Starting Chemouflage Database Setup"

echo "Setting up the database..."
python create_indexes.py
python create_admin_user.py
python create_default_settings.py

echo "Database setup complete!"
