# SQL Learning Platform

A comprehensive SQL learning platform built with React frontend and Django backend, featuring interactive SQL query practice with multiple themes.

## Features

- **Interactive SQL Learning**: Practice SQL queries with real-time feedback
- **Multiple Themes**: Learn with different datasets (Default business data, Harry Potter theme)
- **Progressive Learning**: Structured sections covering SELECT, ORDER BY, WHERE, and DISTINCT
- **Real-time Query Execution**: See query results as you type
- **User Progress Tracking**: Track your learning progress and completion
- **User Profile System**: View detailed statistics, submission history, and problem stats
- **Navigation Bar**: Easy access to profile and authentication features
- **Responsive Design**: Modern UI built with Tailwind CSS

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
│   ├── sql_learning_platform/  # Django project
│   ├── learning/            # Django app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # API serializers
│   │   └── ...
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL (optional, SQLite works for development)
- Redis (optional, for background tasks)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend Setup

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
   # Edit .env with your settings
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

## User Features

### Navigation Bar
- **用户头像**: 显示当前登录用户的头像
- **下拉菜单**: 点击头像查看菜单选项
  - 个人资料：查看详细的用户统计信息
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

- `GET /api/themes/` - List all themes
- `GET /api/themes/{id}/` - Get theme with sections
- `GET /api/sections/` - List all sections
- `GET /api/sections/{id}/concepts/` - Get concepts for a section
- `GET /api/concepts/{id}/problems/` - Get problems for a concept
- `POST /api/problems/{id}/submit_query/` - Submit a query for a problem
- `GET /api/problems/{id}/progress/` - Get user progress for a problem
- `GET /api/progress/stats/` - Get user statistics
- `GET /api/user/profile/` - Get user profile with submissions and stats
- `GET /api/user/submissions/` - Get user submission history
- `GET /api/user/problem-stats/` - Get user problem statistics
- `GET /api/user/concept-stats/` - Get user concept statistics

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
- Tailwind CSS for styling
- Responsive design for mobile and desktop
- Centralized configuration in `src/config/constants.js`
- Client-side routing for navigation between pages
- User session management with localStorage

### Backend Development
- Django REST Framework for API
- Comprehensive models for learning data
- User progress tracking
- Query execution and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
