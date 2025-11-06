#!/usr/bin/env bash
# Django开发服务器启动脚本

cd "$(dirname "$0")"

# 加载.env文件
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 设置DEBUG模式并启动服务器
export DEBUG=True
./venv/bin/python manage.py runserver 0.0.0.0:8080
