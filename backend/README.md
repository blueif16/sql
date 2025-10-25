# SQL Learning Platform Backend

这是SQL学习平台的Django后端服务，集成了Google Gemini AI聊天机器人，可以部署到 Google App Engine。

## 项目结构

```
backend/
├── myproject/          # Django 项目主目录
│   ├── __init__.py    # 包初始化文件
│   ├── settings.py    # 项目配置文件
│   ├── urls.py        # URL 路由配置
│   ├── wsgi.py        # WSGI 应用入口
│   └── asgi.py        # ASGI 应用入口
├── learning/           # 学习应用模块
│   ├── models.py      # 数据模型（包含聊天模型）
│   ├── views.py       # 视图控制器（包含聊天API、题目生成API）
│   ├── serializers.py # 序列化器
│   ├── chatbot.py     # AI聊天机器人服务
│   ├── problem_generator.py  # AI题目生成器
│   ├── urls.py        # URL路由配置
│   └── admin.py       # 管理后台配置
├── manage.py          # Django 管理脚本
├── requirements.txt   # Python 依赖包列表
├── app.yaml           # App Engine 配置文件
├── env.example        # 环境变量示例
└── README.md          # 项目说明文档
```

## 核心功能

### 1. SQL学习管理系统
- 主题（Theme）、章节（Section）、概念（Concept）、题目（Problem）管理
- 用户进度跟踪（UserProgress）
- 查询提交记录（QuerySubmission）
- **AI智能题目生成**：基于用户选择的topic和用户偏好，使用LLM自动生成个性化SQL练习题

### 2. AI聊天机器人
- 集成Google Gemini API
- 支持流式（Streaming）和非流式响应
- 对话历史管理（ChatThread, ChatMessage）
- 题目上下文感知（自动加载题目信息）
- 消息历史修剪（避免超出token限制）

### 3. AI题目生成器
- 使用Instructor库实现结构化LLM输出，无需手动解析JSON
- Pydantic模型直接映射Django Problem模型字段
- 根据用户兴趣标签和主题偏好定制题目
- 自动生成表结构、示例数据和题目描述
- 支持多难度级别的题目生成

**使用流程：**
1. 用户在NavBar中点击"Choose Topic"
2. 选择想要学习的SQL概念
3. 系统从数据库获取用户的主题偏好（ui_theme）和兴趣标签（interest_areas）
4. ProblemGenerator使用Instructor调用Gemini API
5. LLM直接返回验证过的ProblemSchema对象
6. 使用model_dump()将Pydantic模型转换为字典并保存到数据库

### 4. 多语言支持
- 支持中文（zh）和英文（en）两种语言
- SQL概念（Concept）包含 name_zh/name_en 和 description_zh/description_en 字段
- 兴趣领域（InterestArea）包含 display_name_zh/display_name_en 和 description_zh/description_en 字段
- 序列化器自动根据用户语言设置（User.language）返回对应翻译
- ConceptSerializer 提供 localized_name 和 localized_description 字段
- InterestAreaSerializer 提供 localized_display_name 和 localized_description 字段
- 通过 populate_concepts 和 populate_interests 命令管理翻译数据

## 快速开始

### 1. 配置环境变量

复制 `env.example` 为 `.env`：

```bash
cp env.example .env
```

**必需配置：**
- `SECRET_KEY`: Django密钥
- `GOOGLE_API_KEY`: Google Gemini API密钥（从 https://ai.google.dev/ 获取）
- `CLOUD_SQL_CONNECTION_NAME`: Cloud SQL连接名（格式：项目ID:区域:实例名）
- `DB_PASSWORD`: 数据库密码

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 数据库迁移

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. 启动开发服务器

**推荐方式（自动加载.env）：**
```bash
./start_server.sh
```

**或手动启动：**
```bash
# 确保环境变量已加载
export $(cat .env | grep -v '^#' | xargs)
python manage.py runserver 0.0.0.0:8000
```

### 5. 初始化数据（多语言支持）

填充SQL概念和兴趣领域的中英文翻译数据：

```bash
# 初始化SQL概念（中英文翻译）
python manage.py populate_concepts

# 初始化兴趣领域（中英文翻译）
python manage.py populate_interests

# 一次性初始化所有数据
python manage.py populate_data
```

**说明：**
- `populate_concepts`: 创建/更新18个SQL概念（SELECT, WHERE, JOIN等）的中英文翻译
- `populate_interests`: 创建/更新19个兴趣领域（电影、体育、商业等）的中英文翻译
- 使用 `update_or_create` 实现，可重复运行以更新现有数据

### 5. 创建超级用户

```bash
python manage.py createsuperuser
```

### 6. 运行服务

```bash
gunicorn myproject.wsgi:application
```

## 部署到 Google Cloud

### 前置准备

1. 创建Google Cloud项目
2. 启用Cloud SQL Admin API
3. 创建Cloud SQL PostgreSQL实例
4. 创建数据库：`sql_learning`

### 部署步骤

1. **初始化 Google Cloud SDK**
```bash
gcloud init
```

2. **配置环境变量**
在 `app.yaml` 或 Google Cloud Console 中设置：
- `SECRET_KEY`
- `GOOGLE_API_KEY`
- `CLOUD_SQL_CONNECTION_NAME`
- `DB_PASSWORD`

3. **收集静态文件**
```bash
python manage.py collectstatic --noinput
```

4. **部署到 App Engine**
```bash
gcloud app deploy
```

5. **初始化数据库**
```bash
gcloud app browse
# 访问 /admin 创建超级用户
```

## API 端点

### 学习管理
- `GET /api/problems/` - 获取题目列表
- `GET /api/problems/{id}/` - 获取题目详情
- `POST /api/problems/{id}/submit/` - 提交SQL查询
- `GET /api/problems/{id}/progress/` - 获取题目进度
- `POST /api/problems/generate/` - **AI生成题目**（需认证）
  - 请求体：`{ "topic": "INNER JOIN - Combining Tables", "topic_info": "topic详细说明" }`
  - 响应：`{ "success": true, "message": "问题生成成功", "problem": {...} }`

### 用户偏好
- `GET /api/preferences/me/` - 获取当前用户偏好
- `PUT /api/preferences/me/` - 更新用户偏好
  - 请求体：`{ "ui_theme": "dark", "interest_areas": ["电影", "体育"], "difficulty_preference": "medium" }`

### 用户进度
- `GET /api/progress/me/` - 获取当前用户进度
- `GET /api/progress/stats/` - 获取详细统计
- `GET /api/progress/concepts/` - 获取已学概念

### AI聊天机器人
- `POST /api/chat/message/` - 发送消息（非流式）
  - 请求体：`{ "message": "问题", "thread_id": "可选", "problem_id": 1, "language": "zh" }`
  - 响应：`{ "thread_id": "...", "message": "AI回复", "message_id": 1 }`

- `POST /api/chat/stream/` - 发送消息（流式）
  - 请求体同上
  - 响应：SSE流，格式 `data: {"chunk": "文本块"}\n\n`

- `GET /api/chat/history/?thread_id=xxx` - 获取聊天历史
  - 响应：`{ "messages": [{"id": 1, "type": "human", "content": "..."}, ...] }`

- `GET /api/chat/threads/` - 获取用户会话列表（需认证）

## 功能说明

### 1. AI聊天机器人特性
- **智能问答**：回答SQL相关问题，提供概念解释
- **代码分析**：分析用户SQL查询，指出错误和改进建议
- **上下文感知**：自动加载题目信息，提供针对性帮助
- **对话记忆**：保持会话历史，支持多轮对话
- **流式响应**：实时流式输出，提升用户体验
- **多语言支持**：支持中英文对话

### 2. 系统功能
- **管理后台**：Django 自带的管理界面（需要先创建超级用户）
- **中文支持**：语言设置为简体中文，时区为上海
- **CORS配置**：已配置跨域支持前端开发
- **REST API**：完整的RESTful API接口

## 技术栈

- **框架**: Django 5.1.4 + Django REST Framework 3.15.2
- **AI引擎**: Google Gemini API 0.8.3
- **数据库**: PostgreSQL (Google Cloud SQL)
- **Web服务器**: Gunicorn 21.2.0
- **部署平台**: Google App Engine (Python 3.9)
- **配置管理**: python-decouple

## 核心依赖

```
Django==5.1.4              # Web框架
djangorestframework==3.15.2    # REST API
django-cors-headers==4.6.0     # 跨域支持
python-decouple==3.8           # 环境变量管理
psycopg2-binary==2.9.9         # PostgreSQL驱动
gunicorn==21.2.0               # WSGI服务器
google-generativeai==0.8.3     # Gemini AI SDK
instructor==1.7.0              # 结构化LLM输出
pydantic==2.10.4               # 数据验证和序列化
djantic==1.0.2                 # Django模型转Pydantic（可选）
```

