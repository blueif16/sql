from django.contrib import admin  # Django 管理后台
from django.urls import path  # URL 路径配置
from django.http import HttpResponse  # HTTP 响应

def home(request):  # 首页视图函数
    return HttpResponse('<h1>欢迎使用 Django 服务器！</h1><p>服务器运行正常。</p>')

urlpatterns = [  # URL 路由配置
    path('admin/', admin.site.urls),  # 管理后台
    path('', home, name='home'),  # 首页
]

