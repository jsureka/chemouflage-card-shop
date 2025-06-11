#!/bin/bash
echo "Migrating Chemouflage Card Shop from MongoDB to Firebase/Firestore"

# Create backup directory
mkdir -p mongodb_backup

# Backup current MongoDB files
echo "Creating backups of MongoDB files..."
cp backend/main.py mongodb_backup/main.py 2>/dev/null
cp backend/app/db/mongodb.py mongodb_backup/mongodb.py 2>/dev/null
cp backend/app/api/dependencies.py mongodb_backup/dependencies.py 2>/dev/null
cp backend/create_admin_user.py mongodb_backup/create_admin_user.py 2>/dev/null
cp backend/start.bat mongodb_backup/start.bat 2>/dev/null
cp backend/start.sh mongodb_backup/start.sh 2>/dev/null
cp docker-compose.yml mongodb_backup/docker-compose.yml 2>/dev/null
cp docker-compose.dev.yml mongodb_backup/docker-compose.dev.yml 2>/dev/null

# Replace MongoDB files with Firebase/Firestore versions
echo "Replacing MongoDB files with Firebase/Firestore versions..."

# Main application file
cp backend/main.py.new backend/main.py 2>/dev/null

# Dependencies
cp backend/app/api/dependencies.py.new backend/app/api/dependencies.py 2>/dev/null

# Create admin user script
cp backend/create_admin_user.py.new backend/create_admin_user.py 2>/dev/null

# Repository implementations
cp backend/app/repositories/user.py.new backend/app/repositories/user.py 2>/dev/null
cp backend/app/repositories/product.py.new backend/app/repositories/product.py 2>/dev/null
cp backend/app/repositories/order.py.new backend/app/repositories/order.py 2>/dev/null
cp backend/app/repositories/premium_code.py.new backend/app/repositories/premium_code.py 2>/dev/null
cp backend/app/repositories/contact.py.new backend/app/repositories/contact.py 2>/dev/null
cp backend/app/repositories/payment_settings.py.new backend/app/repositories/payment_settings.py 2>/dev/null

# Start scripts
cp backend/start.bat.new backend/start.bat 2>/dev/null
cp backend/start.sh.new backend/start.sh 2>/dev/null
chmod +x backend/start.sh 2>/dev/null

# Docker files
cp docker-compose.yml.new docker-compose.yml 2>/dev/null
cp docker-compose.dev.yml.new docker-compose.dev.yml 2>/dev/null

# Update README
cp backend/README.md.new backend/README.md 2>/dev/null
cp README.md.new README.md 2>/dev/null

echo "Migration completed successfully!"
echo
echo "Please update your environment variables in .env to include Firebase credentials."
echo "See .env.example for reference."
echo
echo "To migrate existing data from MongoDB to Firestore, run:"
echo "python backend/migrate_to_firestore.py"
echo
echo "To start the application with Firebase/Firestore, run:"
echo "cd backend && ./start.sh"
echo
