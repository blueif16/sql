#!/bin/bash

# Quick Migration Script - 快速迁移脚本
# 仅用于修改模型后快速生成和应用迁移，不重启服务器

echo "🔄 执行数据库迁移..."
echo "=================================================="

cd backend

# 生成迁移文件
echo "📝 生成迁移文件..."
python manage.py makemigrations

# 应用迁移
echo "🗄️  应用迁移..."
python manage.py migrate

echo "✅ 迁移完成！"
echo ""
echo "💡 提示: Django 开发服务器会自动重载，无需手动重启"

