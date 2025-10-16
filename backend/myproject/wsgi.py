import os  # 操作系统接口模块
from django.core.wsgi import get_wsgi_application  # WSGI 应用获取函数

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')  # 设置默认配置模块
application = get_wsgi_application()  # 创建 WSGI 应用

