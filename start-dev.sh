#!/bin/bash

# SQL Learning Platform - Development Setup Script

echo "🚀 Starting SQL Learning Platform Development Environment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

echo "🚀 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

cd ..

# Setup Backend
echo ""
echo "🐍 Setting up Backend..."
cd backend

# Check if running in Conda environment
if [ -n "$CONDA_DEFAULT_ENV" ]; then
    echo "🐍 检测到 Conda 环境: $CONDA_DEFAULT_ENV"
    echo "📦 检查依赖包..."
    if ! python -c "import django" 2>/dev/null; then
        echo "📦 安装后端依赖..."
        pip install -r requirements.txt
    else
        echo "✅ 后端依赖已安装"
    fi
else
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "📦 创建 Python 虚拟环境..."
        python3 -m venv venv
    fi

    # Activate virtual environment
    echo "🔧 激活虚拟环境..."
    source venv/bin/activate

    # Install dependencies
    if [ ! -f "venv/.installed" ]; then
        echo "📦 安装后端依赖..."
        pip install -r requirements.txt
        touch venv/.installed
    else
        echo "✅ 后端依赖已安装"
    fi
fi

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Check if data is populated
if ! python manage.py shell -c "from learning.models import Theme; print('Data exists:', Theme.objects.exists())" 2>/dev/null | grep -q "True"; then
    echo "📊 Populating initial data..."
    python manage.py populate_data
else
    echo "✅ Initial data already populated"
fi

echo "🚀 Starting backend development server..."
python manage.py runserver &
BACKEND_PID=$!

cd ..

echo ""
echo "🎉 Development environment started!"
echo "=================================================="
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "Django Admin: http://localhost:8000/admin"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
