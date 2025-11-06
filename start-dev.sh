#!/usr/bin/env bash

# SQL Learning Platform - Development Setup Script

# Parse command line arguments
FORCE_REINSTALL=false
for arg in "$@"; do
    case $arg in
        --reinstall)
            FORCE_REINSTALL=true
            shift
            ;;
        --help|-h)
            echo "Usage: ./start-dev.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --reinstall    Force reinstall all Python dependencies"
            echo "  --help, -h     Show this help message"
            echo ""
            exit 0
            ;;
    esac
done

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
    if [ "$FORCE_REINSTALL" = true ] || ! python -c "import django" 2>/dev/null; then
        if [ "$FORCE_REINSTALL" = true ]; then
            echo "🔄 强制重新安装后端依赖..."
            pip install -r requirements.txt --force-reinstall
        else
            echo "📦 安装后端依赖..."
            pip install -r requirements.txt
        fi
    else
        echo "✅ 后端依赖已安装"
    fi
else
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "📦 创建 Python 虚拟环境 (backend/venv)..."
        python3 -m venv venv
    elif [ "$FORCE_REINSTALL" = true ]; then
        echo "🔄 删除现有虚拟环境并重新创建..."
        rm -rf venv
        python3 -m venv venv
    fi

    # Activate virtual environment
    echo "🔧 激活虚拟环境..."
    source venv/bin/activate

    # Install dependencies
    if [ "$FORCE_REINSTALL" = true ] || [ ! -f "venv/.installed" ]; then
        if [ "$FORCE_REINSTALL" = true ]; then
            echo "🔄 强制重新安装后端依赖..."
        else
            echo "📦 安装后端依赖..."
        fi
        pip install -r requirements.txt
        touch venv/.installed
    else
        echo "✅ 后端依赖已安装 (backend/venv)"
    fi
fi

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Check if data is populated
echo "📊 Checking and populating initial data..."

# Populate concepts
if ! python manage.py shell -c "from learning.models import Concept; import sys; sys.exit(0 if Concept.objects.exists() else 1)" 2>/dev/null; then
    echo "  📝 Populating SQL concepts..."
    python manage.py populate_concepts
else
    echo "  ✅ SQL concepts already populated"
fi

# Populate interests
if ! python manage.py shell -c "from learning.models import InterestArea; import sys; sys.exit(0 if InterestArea.objects.exists() else 1)" 2>/dev/null; then
    echo "  🎯 Populating interest areas..."
    python manage.py populate_interests
else
    echo "  ✅ Interest areas already populated"
fi

# Populate users
if ! python manage.py shell -c "from learning.models import User; import sys; sys.exit(0 if User.objects.filter(username='testuser').exists() else 1)" 2>/dev/null; then
    echo "  👤 Populating users..."
    python manage.py populate_data
else
    echo "  ✅ Users already populated"
fi

echo "🚀 Starting backend development server..."
DEBUG=True python manage.py runserver 8080 &
BACKEND_PID=$!

cd ..

echo ""
echo "🎉 Development environment started!"
echo "=================================================="
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "Django Admin: http://localhost:8080/admin"
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
