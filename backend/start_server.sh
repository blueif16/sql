#!/bin/bash
# Django开发服务器启动脚本

cd "$(dirname "$0")"

# 加载.env文件
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 启动服务器
./venv/bin/python manage.py runserver 0.0.0.0:8000

