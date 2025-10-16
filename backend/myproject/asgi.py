import os  # 操作系统接口模块
from django.core.asgi import get_asgi_application  # ASGI 应用获取函数

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')  # 设置默认配置模块
application = get_asgi_application()  # 创建 ASGI 应用

