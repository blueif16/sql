from django.contrib import admin  # Django 管理后台
from django.urls import path, include  # URL 路径配置
from django.http import HttpResponse  # HTTP 响应
from rest_framework import routers  # REST framework 路由
from learning.views import ThemeViewSet, SectionViewSet, ConceptViewSet, ProblemViewSet, UserProgressViewSet  # 导入视图

# 创建路由器
router = routers.DefaultRouter()
router.register(r'themes', ThemeViewSet, basename='theme')
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'concepts', ConceptViewSet, basename='concept')
router.register(r'problems', ProblemViewSet, basename='problem')
router.register(r'progress', UserProgressViewSet, basename='progress')

def home(request):  # 首页视图函数
<<<<<<< HEAD
    return HttpResponse('<h1>Welcome to Django Server!</h1><p>Server is running successfully.</p>')

def health_check(request):  # 健康检查端点
    """
    Simple health check endpoint to verify backend is running.
    """
    return HttpResponse('OK', status=200)

urlpatterns = [  # URL 路由配置
    path('admin/', admin.site.urls),  # 管理后台
    path('health/', health_check, name='health_check'),  # 健康检查
    path('api/', include(router.urls)),  # REST API 路由
    path('api-auth/', include('rest_framework.urls')),  # REST framework 认证
=======
    return HttpResponse('<h1>欢迎使用 SQL Learning Platform！</h1><p>API: <a href="/api/">/api/</a> | Admin: <a href="/admin/">/admin/</a></p>')

urlpatterns = [  # URL 路由配置
    path('admin/', admin.site.urls),  # 管理后台
    path('api/', include('learning.urls')),  # Learning API（包含聊天机器人）
>>>>>>> f70a993 (v1 full generation of problem + chat + load topics + django db setup)
    path('', home, name='home'),  # 首页
]

