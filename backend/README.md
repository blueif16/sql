# Django 服务器项目

这是一个最基本的 Django 服务器，可以部署到 Google App Engine。

## 项目结构

```
5200/
├── myproject/          # Django 项目主目录
│   ├── __init__.py    # 包初始化文件
│   ├── settings.py    # 项目配置文件
│   ├── urls.py        # URL 路由配置
│   ├── wsgi.py        # WSGI 应用入口
│   └── asgi.py        # ASGI 应用入口
├── manage.py          # Django 管理脚本
├── requirements.txt   # Python 依赖包列表
├── app.yaml           # App Engine 配置文件
├── .gcloudignore      # 部署时忽略的文件
└── README.md          # 项目说明文档
```

## 本地开发

### 安装依赖

```bash
pip install -r requirements.txt
```

### 数据库迁移

```bash
python manage.py migrate
```

### 创建超级用户（可选）

```bash
python manage.py createsuperuser
```

### 本地运行

```bash
python manage.py runserver
```

访问 http://127.0.0.1:8000 查看首页
访问 http://127.0.0.1:8000/admin 进入管理后台

## 部署到 Google App Engine

### 1. 初始化 Google Cloud SDK

```bash
gcloud init
```

选择或创建您的 Google Cloud 项目。

### 2. 收集静态文件

```bash
python manage.py collectstatic --noinput
```

### 3. 部署应用

```bash
gcloud app deploy
```

App Engine 会自动：
- 读取 `app.yaml` 配置
- 安装 `requirements.txt` 中的依赖
- 使用 Python 3.9 运行环境
- 用 Gunicorn 启动 Django 应用

### 4. 查看部署的应用

```bash
gcloud app browse
```

## App Engine vs Cloud Run

本项目使用 **App Engine** 配置：
- ✅ 使用 `app.yaml` 指定运行时环境
- ✅ 不需要编写 Dockerfile
- ✅ 平台自动处理容器化
- ✅ 更托管化，适合快速部署

如果要使用 **Cloud Run**，需要：
- ❌ 移除 `app.yaml`
- ✅ 创建 `Dockerfile`
- ✅ 手动容器化应用

## 功能说明

- **首页**：显示欢迎信息，确认服务器运行正常
- **管理后台**：Django 自带的管理界面（需要先创建超级用户）
- **中文支持**：语言设置为简体中文，时区为上海
- **静态文件**：已配置静态文件处理

## 注意事项

1. 生产环境请修改 `settings.py` 中的 `SECRET_KEY`
2. 生产环境请将 `DEBUG` 设置为 `False`
3. 如需使用 Cloud SQL 数据库，请修改 `DATABASES` 配置
4. 首次部署可能需要几分钟时间

