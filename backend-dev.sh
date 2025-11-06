#!/usr/bin/env bash

# Backend Development Script - 后端开发脚本
# 用于启动后端服务器并自动处理数据库迁移

echo "🐍 后端开发环境启动脚本"
echo "=================================================="

# 检查是否在项目根目录
if [ ! -d "backend" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

cd backend

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 配置文件..."
    cat > .env << 'EOF'
# === 本地开发配置 ===
DEBUG=True
USE_CLOUD_SQL=False
GOOGLE_API_KEY=your-google-api-key-here

# Uncomment and set your actual Google API key for AI features:
# GOOGLE_API_KEY=your-actual-api-key-here
EOF
    echo "✅ .env 配置文件已创建"
    echo "⚠️  如需AI功能，请编辑 backend/.env 文件，设置 GOOGLE_API_KEY"
fi

# 检查 Python 环境
if [ -n "$CONDA_DEFAULT_ENV" ]; then
    echo "🐍 使用 Conda 环境: $CONDA_DEFAULT_ENV"
else
    echo "🐍 使用当前 Python 环境"
fi

# 生成迁移文件（如果有模型变更）
echo "🔍 检查模型变更..."
python manage.py makemigrations

# 执行数据库迁移
echo "🗄️  执行数据库迁移..."
python manage.py migrate

# 检查并填充初始数据
echo "📊 检查并填充初始数据..."

# 填充概念数据
if ! python manage.py shell -c "from learning.models import Concept; import sys; sys.exit(0 if Concept.objects.exists() else 1)" 2>/dev/null; then
    echo "  📝 填充 SQL 概念..."
    python manage.py populate_concepts
else
    echo "  ✅ SQL 概念已存在"
fi

# 填充兴趣领域
if ! python manage.py shell -c "from learning.models import InterestArea; import sys; sys.exit(0 if InterestArea.objects.exists() else 1)" 2>/dev/null; then
    echo "  🎯 填充兴趣领域..."
    python manage.py populate_interests
else
    echo "  ✅ 兴趣领域已存在"
fi

# 填充用户数据
if ! python manage.py shell -c "from learning.models import User; import sys; sys.exit(0 if User.objects.filter(username='testuser').exists() else 1)" 2>/dev/null; then
    echo "  👤 填充用户数据..."
    python manage.py populate_data
else
    echo "  ✅ 用户数据已存在"
fi

# 启动开发服务器
echo ""
echo "🚀 启动 Django 开发服务器..."
echo "=================================================="
echo "📍 API 地址: http://127.0.0.1:8080/api/"
echo "📍 Admin 后台: http://127.0.0.1:8080/admin/"
echo ""
echo "💡 提示: 修改模型后，按 Ctrl+C 停止服务器，重新运行此脚本"
echo "=================================================="
echo ""

DEBUG=True python manage.py runserver 8080
