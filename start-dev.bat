@echo off
REM SQL Learning Platform - Development Setup Script for Windows

echo 🚀 Starting SQL Learning Platform Development Environment
echo ==================================================

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check prerequisites
echo 📋 Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9+
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd frontend

if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
) else (
    echo ✅ Frontend dependencies already installed
)

echo 🚀 Starting frontend development server...
start "Frontend Server" cmd /k "npm run dev"

cd ..

REM Setup Backend
echo.
echo 🐍 Setting up Backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
if not exist "venv\.installed" (
    echo 📦 Installing backend dependencies...
    pip install -r requirements.txt
    echo. > venv\.installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Run migrations
echo 🗄️ Running database migrations...
python manage.py migrate

REM Check if data is populated and populate if needed
echo 📊 Populating initial data...
python manage.py populate_data

echo 🚀 Starting backend development server...
start "Backend Server" cmd /k "call venv\Scripts\activate.bat && python manage.py runserver"

cd ..

echo.
echo 🎉 Development environment started!
echo ==================================================
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo Django Admin: http://localhost:8000/admin
echo.
echo Press any key to exit...
pause >nul
