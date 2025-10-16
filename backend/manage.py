#!/usr/bin/env python
import os  # 操作系统接口模块
import sys  # 系统相关模块

def main():  # 主函数
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')  # 设置默认配置
    try:
        from django.core.management import execute_from_command_line  # Django 命令行执行函数
    except ImportError as exc:
        raise ImportError(
            "无法导入 Django。请确保已安装 Django 并且"
            "环境变量 PYTHONPATH 设置正确。"
        ) from exc
    execute_from_command_line(sys.argv)  # 执行命令行参数

if __name__ == '__main__':
    main()

