import os  # 操作系统接口模块
from pathlib import Path  # 路径操作模块

BASE_DIR = Path(__file__).resolve().parent.parent  # 项目根目录
SECRET_KEY = 'django-insecure-change-this-in-production-123456789'  # 密钥（生产环境需更改）
DEBUG = os.getenv('DEBUG', 'True') == 'True'  # 调试模式
ALLOWED_HOSTS = ['*']  # 允许的主机列表

INSTALLED_APPS = [  # 已安装的应用
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [  # 中间件配置
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myproject.urls'  # 根 URL 配置

TEMPLATES = [  # 模板配置
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myproject.wsgi.application'  # WSGI 应用

DATABASES = {  # 数据库配置
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [  # 密码验证器
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'zh-hans'  # 语言代码（简体中文）
TIME_ZONE = 'Asia/Shanghai'  # 时区（上海）
USE_I18N = True  # 启用国际化
USE_TZ = True  # 启用时区支持

STATIC_URL = '/static/'  # 静态文件 URL
STATIC_ROOT = os.path.join(BASE_DIR, 'static')  # 静态文件收集目录

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'  # 默认主键字段类型

