import os  # 操作系统接口模块
from pathlib import Path  # 路径操作模块
from decouple import config  # 环境变量配置模块

BASE_DIR = Path(__file__).resolve().parent.parent  # 项目根目录
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production-123456789')  # 密钥（生产环境需更改）
DEBUG = config('DEBUG', default='False', cast=bool)  # 调试模式
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=lambda v: [s.strip() for s in v.split(',')])  # 允许的主机列表

INSTALLED_APPS = [  # 已安装的应用
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'learning',
]

MIDDLEWARE = [  # 中间件配置
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
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

USE_CLOUD_SQL = config('USE_CLOUD_SQL', default='False', cast=bool)  # 是否使用Cloud SQL
if USE_CLOUD_SQL:  # 生产环境：PostgreSQL on Cloud SQL
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'HOST': config('DB_HOST', default='/cloudsql/' + config('CLOUD_SQL_CONNECTION_NAME', default='')),
            'PORT': config('DB_PORT', default='5432'),
            'NAME': config('DB_NAME', default='sql_learning'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
        }
    }
else:  # 本地开发：SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'learning.User'  # 自定义用户模型

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

# CORS settings
CORS_ALLOWED_ORIGINS = [  # 允许的跨域来源
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
CORS_ALLOW_CREDENTIALS = True  # 允许携带凭证

# CSRF settings for cross-origin requests
CSRF_TRUSTED_ORIGINS = [  # CSRF可信来源
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
SESSION_COOKIE_SAMESITE = 'Lax'  # 允许跨站请求携带Cookie
SESSION_COOKIE_SECURE = False  # 开发环境不要求HTTPS
CSRF_COOKIE_SAMESITE = 'Lax'  # CSRF Cookie跨站设置
CSRF_COOKIE_SECURE = False  # 开发环境不要求HTTPS

# REST Framework settings
REST_FRAMEWORK = {  # REST框架配置
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# Logging settings  # 日志配置
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'learning': {  # learning app的日志
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

