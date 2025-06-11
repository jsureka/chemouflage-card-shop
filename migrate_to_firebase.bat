@echo off
echo Migrating Chemouflage Card Shop from MongoDB to Firebase/Firestore

REM Create backup directory
mkdir mongodb_backup 2>nul

REM Backup current MongoDB files
echo Creating backups of MongoDB files...
copy backend\main.py mongodb_backup\main.py >nul
copy backend\app\db\mongodb.py mongodb_backup\mongodb.py >nul
copy backend\app\api\dependencies.py mongodb_backup\dependencies.py >nul
copy backend\create_admin_user.py mongodb_backup\create_admin_user.py >nul
copy backend\start.bat mongodb_backup\start.bat >nul
copy backend\start.sh mongodb_backup\start.sh >nul
copy docker-compose.yml mongodb_backup\docker-compose.yml >nul
copy docker-compose.dev.yml mongodb_backup\docker-compose.dev.yml >nul

REM Replace MongoDB files with Firebase/Firestore versions
echo Replacing MongoDB files with Firebase/Firestore versions...

REM Main application file
copy backend\main.py.new backend\main.py >nul

REM Dependencies
copy backend\app\api\dependencies.py.new backend\app\api\dependencies.py >nul

REM Create admin user script
copy backend\create_admin_user.py.new backend\create_admin_user.py >nul

REM Repository implementations
copy backend\app\repositories\user.py.new backend\app\repositories\user.py >nul
copy backend\app\repositories\product.py.new backend\app\repositories\product.py >nul
copy backend\app\repositories\order.py.new backend\app\repositories\order.py >nul
copy backend\app\repositories\premium_code.py.new backend\app\repositories\premium_code.py >nul
copy backend\app\repositories\contact.py.new backend\app\repositories\contact.py >nul
copy backend\app\repositories\payment_settings.py.new backend\app\repositories\payment_settings.py >nul

REM Start scripts
copy backend\start.bat.new backend\start.bat >nul
copy backend\start.sh.new backend\start.sh >nul

REM Docker files
copy docker-compose.yml.new docker-compose.yml >nul
copy docker-compose.dev.yml.new docker-compose.dev.yml >nul

REM Update README
copy backend\README.md.new backend\README.md >nul

echo Migration completed successfully!
echo.
echo Please update your environment variables in .env to include Firebase credentials.
echo See .env.example for reference.
echo.
echo To migrate existing data from MongoDB to Firestore, run:
echo python backend\migrate_to_firestore.py
echo.
echo To start the application with Firebase/Firestore, run:
echo cd backend ^&^& start.bat
echo.
pause
