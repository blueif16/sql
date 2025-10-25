# SQL Learning Platform

一个全面的SQL学习平台，采用React前端和Django后端，集成Google Gemini AI聊天机器人，提供交互式SQL查询练习和智能学习辅助。

## 核心功能

### AI聊天机器人 (新功能)
- **智能SQL助手**: 集成Google Gemini API，提供专业的SQL学习指导
- **实时对话**: 支持流式响应，实时获取AI回复
- **上下文感知**: 自动加载题目信息，提供针对性帮助
- **双模式切换**: 问答模式和解题模式自由切换
- **对话记忆**: 保持会话历史，支持多轮连续对话
- **多语言支持**: 支持中英文对话

### 学习系统
- **交互式SQL学习**: 实时反馈的SQL查询练习
- **多主题支持**: 不同数据集学习（商业数据、哈利波特主题等）
- **渐进式学习**: 结构化章节，涵盖SELECT、ORDER BY、WHERE、DISTINCT等
- **实时查询执行**: 即时查看查询结果
- **进度跟踪**: 跟踪学习进度和完成情况
- **用户资料系统**: 详细的统计信息、提交历史和题目统计
- **导航栏**: 便捷访问个人资料和认证功能
- **响应式设计**: Tailwind CSS构建的现代UI

## Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool
- **Axios** - HTTP client for API calls

### Backend
- **Django 5.1** - Python web framework
- **Django REST Framework** - API development
- **Google Gemini API** - AI聊天机器人（google-generativeai 0.8.3）
- **PostgreSQL** - Database (SQLite for development)
- **Celery** - Background task processing
- **Redis** - Message broker and cache

## Project Structure

```
MySQLtutor/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── NavBar.jsx    # Navigation bar with user menu
│   │   │   ├── ProfilePage.jsx  # User profile and stats
│   │   │   └── ...
│   │   ├── config/          # Configuration files
│   │   │   └── constants.js  # Centralized constants
│   │   ├── data/            # Theme data
│   │   ├── utils/           # Utility functions
│   │   └── ...
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Django backend
│   ├── myproject/           # Django project
│   ├── learning/            # Django app
│   │   ├── models.py        # Database models (包含聊天模型)
│   │   ├── views.py         # API views (包含聊天API)
│   │   ├── serializers.py   # API serializers
│   │   ├── chatbot.py       # AI聊天机器人服务
│   │   └── ...
│   ├── requirements.txt
│   └── env.example          # 环境变量示例
└── README.md
```

## Getting Started

### 🚀 快速体验（Mock Server - 无需数据库）

**最快启动方式**：
```bash
# 后端
cd backend
pip install -r requirements-mock.txt
export GOOGLE_API_KEY=your-key
python mock_server.py

# 前端
cd frontend
npm install && npm run dev
```

访问 http://localhost:5173 即可体验完整功能！

详见 [MOCK_SERVER_GUIDE.md](MOCK_SERVER_GUIDE.md)

---

### 📋 完整版本（需要数据库）

#### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- **Google API Key** (从 https://ai.google.dev/ 获取，用于AI聊天机器人)
- PostgreSQL (optional, SQLite works for development)
- Redis (optional, for background tasks)

### 🚀 一键启动开发环境（推荐）

#### 方式1：启动完整开发环境（前后端）
```bash
./start-dev.sh
```
这将自动启动前端和后端服务器，并完成所有初始化。

#### 方式2：仅启动后端（推荐后端开发）

**使用 Conda 环境（推荐）：**
```bash
# 1. 激活 conda 环境
conda activate your-env-name

# 2. 首次运行需要安装依赖
cd backend && pip install -r requirements.txt && cd ..

# 3. 启动后端
./backend-dev.sh
```

**使用系统 Python：**
```bash
./backend-dev.sh
```

这个脚本会自动完成：
- ✅ 检测并使用当前 Python 环境（Conda/系统）
- ✅ 生成并执行数据库迁移
- ✅ 填充初始数据
- ✅ 启动开发服务器

访问地址：
- 前端: http://localhost:5173
- 后端 API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

### ⚙️ 手动配置（可选）

<details>
<summary>展开查看详细步骤</summary>

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (可选) 配置环境变量:
   ```bash
   cp .env.example .env
   # 前端默认连接 http://localhost:8000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env
   # 编辑.env文件，必须设置以下关键配置：
   # GOOGLE_API_KEY=your-google-api-key-here  # 必需，用于AI聊天机器人
   # GEMINI_MODEL=gemini-2.0-flash-exp        # 可选，默认模型
   # CHAT_MAX_TOKENS=65                       # 可选，历史消息最大token数
   # CHAT_TEMPERATURE=0.7                     # 可选，生成温度
   ```

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Populate initial data:
   ```bash
   python manage.py populate_data
   ```

8. Start the development server:
   ```bash
   python manage.py runserver
   ```

The backend API will be available at `http://localhost:8000`

</details>

### 🔄 开发工作流

#### 修改数据库模型后
```bash
# 方式1：使用快速迁移脚本（推荐）
conda activate your-env-name  # 如果使用 conda
./migrate.sh

# 方式2：手动执行
cd backend
python manage.py makemigrations
python manage.py migrate
```

**注意**: 
- ✅ Django 开发服务器会自动重载代码，修改普通代码（views, serializers等）无需重启
- ✅ 只有修改模型（models.py）时需要运行迁移
- ✅ 脚本会自动使用当前激活的 Conda 环境或系统 Python

详细的数据库工作流程请参考: [backend/DATABASE_WORKFLOW.md](backend/DATABASE_WORKFLOW.md) 或 [DEV_WORKFLOW.md](DEV_WORKFLOW.md)

## 使用说明

### AI聊天机器人
在题目详情页面（ProblemDetailPage），左侧是AI聊天机器人界面：

#### 问答模式
- 向AI提问SQL相关问题
- 获取概念解释和学习建议
- AI会根据当前题目提供针对性帮助

#### 解题模式
- 在聊天框输入SQL查询
- AI帮助提交查询到系统
- 实时获取执行结果和反馈

#### 功能特性
- **流式响应**: 实时显示AI思考过程
- **对话记忆**: 记住上下文，支持连续对话
- **智能提示**: 根据题目自动加载相关信息
- **模式切换**: 随时在问答和解题模式间切换

### 导航栏
- **用户头像**: 显示当前登录用户的头像
- **下拉菜单**: 点击头像查看菜单选项
  - 个人资料：查看详细的用户统计信息
  - Choose Topic（选择主题）：按难度分类查看并选择SQL概念
    - **按难度分列**: 三列布局分别显示 Beginner（基础）、Intermediate（进阶）、Advanced（高级）概念
    - **进度展示**: 每个概念显示用户已解决题目数和总题目数，以及进度条
    - **多选支持**: 可以同时选择多个感兴趣的主题
    - **保存偏好**: 点击"保存偏好"按钮将选择的主题保存到数据库
    - **生成题目**: 基于选中的主题随机生成相关题目
    - **持久化**: 用户偏好会自动保存，下次打开时自动加载
    - **概念详情**: 每个概念卡片显示名称、描述和学习进度
  - 语言切换（新功能）：在中文和英文之间切换界面语言
    - **一键切换**: 点击语言按钮即可切换语言
    - **实时生效**: 界面文本立即更新
    - **持久化保存**: 语言偏好自动保存至浏览器本地，刷新页面保持选择
    - **全局支持**: 支持导航栏、下拉菜单、主题选择等所有UI元素
  - 登录/退出：用户认证管理

### Profile Page (个人资料页)
个人资料页面包含三个主要标签：

#### 概览 (Overview)
- **概念掌握情况**: 可视化展示各SQL概念的掌握程度
- **最近提交**: 显示最近的提交记录和结果

#### 提交历史 (Submissions)
- 完整的提交历史记录
- 显示题目、状态、提示使用数、用时和提交时间
- 通过/失败状态标识

#### 统计数据 (Stats)
- **问题统计**: 按题目展示尝试次数、难度、通过状态等
- **概念统计**: 显示每个SQL概念的准确率、尝试次数和平均用时
- **总体统计卡片**: 总提交数、正确提交数、题目总数、正确率

### 数据结构映射
基于 `setup.sql` 的数据库结构：
- **users**: 用户基本信息 (id, username, email, created_at)
- **Submissions**: 提交记录 (problem_id, user_id, sql_code, is_correct, submitted_at, hints_used, time_spent_seconds)
- **user_problem_stats**: 用户问题统计 (total_attempts, passed, attempts_until_pass, best_time_seconds)
- **user_concept_stats**: 用户概念统计 (total_attempts, correct_attempts, accuracy, avg_time_seconds)

## API Endpoints

### 学习管理
- `GET /api/themes/` - 获取主题列表
- `GET /api/themes/{id}/` - 获取主题详情及章节
- `GET /api/sections/` - 获取章节列表
- `GET /api/sections/{id}/concepts/` - 获取章节的概念
- `GET /api/concepts/{id}/problems/` - 获取概念的题目
- `POST /api/problems/{id}/submit_query/` - 提交SQL查询
- `GET /api/problems/{id}/progress/` - 获取题目进度
- `POST /api/problems/generate/` - 基于主题生成新题目
  - 请求: `{ "topic": "主题名称", "topic_info": "主题描述" }`
  - 响应: `{ "success": true, "problem": {...} }`
- `GET /api/progress/stats/` - 获取用户统计
- `GET /api/user/profile/` - 获取用户资料、提交记录和统计
- `GET /api/user/submissions/` - 获取提交历史
- `GET /api/user/problem-stats/` - 获取题目统计
- `GET /api/user/concept-stats/` - 获取概念统计

### 概念管理 (新)
- `GET /api/concepts/` - 获取所有SQL概念列表
- `GET /api/concepts/{id}/` - 获取单个概念详情
- `GET /api/concepts/with_progress/` - 获取按难度分组的概念及用户进度
  - 响应: 
    ```json
    {
      "beginner": [
        {
          "id": 1,
          "name": "SELECT",
          "description": "SELECT语句用于从数据库中查询数据...",
          "difficulty_level": "beginner",
          "prerequisites": [],
          "solved": 3,
          "total": 10,
          "progress_percentage": 30.0
        }
      ],
      "intermediate": [...],
      "advanced": [...]
    }
    ```

### 用户偏好管理 (新)
- `GET /api/preferences/me/` - 获取当前用户偏好设置
  - 响应: `{ "difficulty_preference": "easy", "interest_areas": ["SELECT", "JOIN"], ... }`
- `PATCH /api/preferences/me/` - 更新用户偏好设置（部分更新）
  - 请求: `{ "interest_areas": ["SELECT", "WHERE", "JOIN"] }`
  - 可更新字段: difficulty_preference, learning_style, interest_areas, ui_theme

### AI聊天机器人 (新)
- `POST /api/chat/message/` - 发送消息（非流式）
  - 请求: `{ "message": "问题", "thread_id": "可选", "problem_id": 1, "language": "zh" }`
  - 响应: `{ "thread_id": "...", "message": "AI回复", "message_id": 1 }`
- `POST /api/chat/stream/` - 发送消息（流式SSE）
  - 实时流式响应，格式: `data: {"chunk": "文本块"}\n\n`
- `GET /api/chat/history/?thread_id=xxx` - 获取聊天历史
- `GET /api/chat/threads/` - 获取用户会话列表（需认证）

## Learning Path

The platform is organized into three main sections:

### Section 1: Querying Data
- **SELECT FROM**: Learn to retrieve data from tables
- Practice with basic SELECT statements
- Understand column selection vs. selecting all columns

### Section 2: Sorting Data
- **ORDER BY**: Organize query results
- Practice ascending and descending sorts
- Learn to sort by different columns

### Section 3: Filtering Data
- **WHERE**: Filter data based on conditions
- Practice simple and complex conditions
- **DISTINCT**: Remove duplicate rows
- Learn to get unique values

## Themes

### Default Theme
Business-focused dataset with customers and products tables.

### Harry Potter Theme
Magical world dataset with students and spells tables.

## Development

### Frontend Development
- Components are organized by functionality
- **AIChatInterface.jsx**: AI聊天机器人组件
- Tailwind CSS for styling
- Responsive design for mobile and desktop
- Centralized configuration in `src/config/constants.js`
- Client-side routing for navigation between pages
- User session management with localStorage
- **Stream API**: 实现SSE流式响应

### Backend Development
- Django REST Framework for API
- **chatbot.py**: Google Gemini AI集成服务
  - SQLChatbot类：核心聊天机器人逻辑
  - 支持流式和非流式响应
  - 自动消息历史管理和修剪
  - 上下文感知（题目信息自动加载）
- Comprehensive models for learning data
- ChatThread和ChatMessage模型：对话持久化
- User progress tracking
- Query execution and validation

## 配置说明

### 前端配置 (constants.js)
```javascript
export const CHAT_CONFIG = {
  USE_AI_CHATBOT: true,      // 启用AI聊天机器人
  USE_STREAMING: true,        // 使用流式响应
  STORAGE_KEY: 'sql_platform_chat_thread',
  DEFAULT_LANGUAGE: 'zh',     // 默认语言
};

export const LANGUAGE_CONFIG = {
  STORAGE_KEY: 'sql_platform_language', // 语言偏好存储键
  DEFAULT_LANGUAGE: 'zh',     // 默认界面语言（zh/en）
  LANGUAGES: ['en', 'zh'],    // 支持的语言列表
};

// UI文本翻译配置
export const UI_TEXTS = {
  en: { navbar: {...} },      // 英文翻译
  zh: { navbar: {...} }       // 中文翻译
};
```

### 多语言使用说明

#### 在组件中使用多语言
```javascript
import { useLanguage } from '../hooks/useLanguage';

function MyComponent() {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();
  const texts = t('navbar'); // 获取navbar部分的翻译
  
  return (
    <div>
      <h1>{texts.appName}</h1>
      <button onClick={toggleLanguage}>
        {language === 'zh' ? 'English' : '中文'}
      </button>
    </div>
  );
}
```

#### 添加新的翻译文本
1. 在 `constants.js` 的 `UI_TEXTS` 中添加新的翻译键值对
2. 同时在 `en` 和 `zh` 两个语言对象中添加对应文本
3. 在组件中使用 `texts.yourKey` 访问

#### 扩展到其他组件
要为其他组件添加多语言支持：
1. 导入 `useLanguage` hook
2. 在 `UI_TEXTS` 中添加对应组件的翻译
3. 替换硬编码文本为翻译变量

### 后端配置 (环境变量)
```bash
# 必需
GOOGLE_API_KEY=your-api-key-here

# 可选
GEMINI_MODEL=gemini-2.0-flash-exp
CHAT_MAX_TOKENS=65
CHAT_TEMPERATURE=0.7
```

## 注意事项

1. **API密钥**: 必须在后端配置有效的`GOOGLE_API_KEY`才能使用聊天机器人
2. **Token限制**: Gemini API有token限制，系统会自动修剪历史消息
3. **流式响应**: 使用Server-Sent Events (SSE)实现，需要浏览器支持
4. **对话持久化**: 会话ID存储在localStorage，刷新页面保持对话
5. **CORS设置**: 确保后端CORS配置允许前端域名访问

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 故障排除

### psycopg2 编译错误（macOS）

如果在安装 `psycopg2-binary` 时遇到编译错误，可以使用以下解决方案：

#### 方案A：使用 Mock Server（推荐新手）
```bash
cd backend
pip install -r requirements-mock.txt
python mock_server.py
```

#### 方案B：使用 SQLite 开发（推荐开发环境）
```bash
cd backend
pip install -r requirements-sqlite.txt
# 在 .env 中确保：DATABASE_URL=sqlite:///db.sqlite3
python manage.py migrate
python manage.py runserver
```

#### 方案C：修复 PostgreSQL 依赖（生产环境）
```bash
# 1. 安装 PostgreSQL
brew install postgresql@16 libpq

# 2. 设置环境变量
export LDFLAGS="-L/usr/local/opt/postgresql@16/lib"
export CPPFLAGS="-I/usr/local/opt/postgresql@16/include"

# 3. 安装 psycopg2
pip install psycopg2-binary==2.9.9
```

#### 方案D：使用较旧版本
```bash
pip install psycopg2-binary==2.9.5
```

### 依赖冲突警告

如果看到 `langchain-google-genai` 或其他包的依赖冲突警告，只要核心功能正常运行即可忽略。这些是第三方包的版本兼容性问题，不影响本项目。

## License

This project is licensed under the MIT License.
