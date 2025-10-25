# Django Database Workflow Guide

## Overview: Django ORM

**Django ORM (Object-Relational Mapping)** is a powerful abstraction layer that:
- Converts Python classes (models) into database tables
- Translates Python code into SQL queries automatically
- Manages database schema changes through migrations
- Supports multiple database backends (SQLite, PostgreSQL, MySQL, etc.)

### Why We Use Django ORM Here

1. **Single Source of Truth**: Define database schema once in `models.py`
2. **Database Agnostic**: Same code works with SQLite (local) and PostgreSQL (production)
3. **Automatic Migrations**: Track and version control all schema changes
4. **Type Safety**: Python type checking instead of raw SQL strings
5. **Cross-Platform**: No database-specific SQL syntax needed

---

## Project Database Architecture

```
models.py (Python Classes)
    ↓
Django Migrations (Python Files)
    ↓
├─→ SQLite (Local Development)
└─→ PostgreSQL (Production - Google Cloud SQL)
```

**Key Configuration**: `USE_CLOUD_SQL` environment variable switches between databases

---

## Local Development Commands

### 快速启动（推荐）

```bash
# 在项目根目录运行后端开发脚本（Mac/Linux）
./backend-dev.sh

# 这个脚本会自动完成：
# 1. 创建/激活虚拟环境
# 2. 安装依赖包
# 3. 生成并执行数据库迁移
# 4. 填充初始数据
# 5. 启动开发服务器
```

### 修改模型后的快速迁移

```bash
# 方式1：使用快速迁移脚本（推荐）
./migrate.sh

# 方式2：手动执行迁移命令
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate

# 注意：Django 开发服务器会自动重载，无需重启
```

### Initial Setup (手动配置)

```bash
# Navigate to backend directory
cd /Users/tk/Desktop/leetcode_sql/backend

# Create environment file
cp env.example .env

# Edit .env (minimum required)
DEBUG=True
USE_CLOUD_SQL=False
GOOGLE_API_KEY=your-api-key-here

# Install dependencies
pip install -r requirements.txt
```

### Database Operations

```bash
# Generate migration files from model changes
python manage.py makemigrations

# Apply migrations to database (creates/updates tables)
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Check for issues before deploying
python manage.py check --deploy
```

### Running Development Server

```bash
# Start Django development server
python manage.py runserver

# Access points:
# - API: http://127.0.0.1:8000/api/
# - Admin: http://127.0.0.1:8000/admin/
```

### Useful Development Commands

```bash
# View current migrations
python manage.py showmigrations

# View SQL that will be executed
python manage.py sqlmigrate learning 0001

# Open Django shell (interactive Python with models)
python manage.py shell

# Reset database (SQLite only - deletes all data)
rm db.sqlite3
python manage.py migrate

# Create database backup
python manage.py dumpdata > backup.json

# Restore from backup
python manage.py loaddata backup.json
```

---

## Production Deployment Commands

### Prerequisites

```bash
# Install Google Cloud SDK
# Visit: https://cloud.google.com/sdk/docs/install

# Initialize and login
gcloud init
gcloud auth login

# Set project
gcloud config set project YOUR-PROJECT-ID
```

### Database Setup (One-time)

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create sql-learning-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=asia-east1

# Create database
gcloud sql databases create sql_learning \
  --instance=sql-learning-db

# Set database password
gcloud sql users set-password postgres \
  --instance=sql-learning-db \
  --password=YOUR-SECURE-PASSWORD

# Get connection name (needed for configuration)
gcloud sql instances describe sql-learning-db | grep connectionName
# Output: YOUR-PROJECT:region:sql-learning-db
```

### Environment Configuration

Update `app.yaml` with environment variables:

```yaml
env_variables:
  DJANGO_SETTINGS_MODULE: 'myproject.settings'
  DEBUG: 'False'
  USE_CLOUD_SQL: 'True'
  SECRET_KEY: 'your-secret-key-here'
  CLOUD_SQL_CONNECTION_NAME: 'your-project:region:instance-name'
  DB_PASSWORD: 'your-database-password'
  GOOGLE_API_KEY: 'your-api-key-here'
  ALLOWED_HOSTS: 'your-app-id.appspot.com'
```

### Deployment Process

```bash
# Collect static files
python manage.py collectstatic --noinput

# Deploy application to App Engine
gcloud app deploy

# Initial deployment: Run migrations on production database
gcloud app instances ssh [INSTANCE-ID] --command="cd /srv && python manage.py migrate"

# View deployed application
gcloud app browse

# View logs
gcloud app logs tail -s default
```

### Database Migration on Production

**After deploying code with new migrations:**

```bash
# Method 1: SSH into instance
gcloud app instances ssh [INSTANCE-ID]
cd /srv
python manage.py migrate
exit

# Method 2: One-line command
gcloud app instances ssh [INSTANCE-ID] --command="cd /srv && python manage.py migrate"

# Method 3: Use Cloud Shell
# Go to Google Cloud Console → Activate Cloud Shell
# Then run: gcloud app instances ssh ... (same as above)
```

### Production Monitoring

```bash
# List instances
gcloud app instances list

# View database info
gcloud sql instances describe sql-learning-db

# Connect to Cloud SQL directly (for debugging)
gcloud sql connect sql-learning-db --user=postgres --database=sql_learning

# View App Engine versions
gcloud app versions list

# Rollback to previous version
gcloud app versions migrate VERSION-ID
```

---

## Common Workflow: Making Database Changes

### Local Development

```bash
# 1. Edit models
vim learning/models.py

# 2. Generate migration file
python manage.py makemigrations
# Output: Created migration 0003_add_new_field.py

# 3. Review migration file (optional)
cat learning/migrations/0003_add_new_field.py

# 4. Apply to local SQLite
python manage.py migrate
# Output: Running migrations: OK

# 5. Test locally
python manage.py runserver
```

### Deploy to Production

```bash
# 6. Commit changes (include migration files!)
git add learning/models.py
git add learning/migrations/0003_add_new_field.py
git commit -m "Add new field to model"
git push

# 7. Deploy to App Engine
gcloud app deploy

# 8. Apply migrations to production PostgreSQL
gcloud app instances ssh [INSTANCE-ID] --command="cd /srv && python manage.py migrate"

# 9. Verify deployment
gcloud app browse
```

---

## Important Notes

### Do's ✅

- Always generate migrations locally first
- Commit migration files to version control
- Test migrations on local database before production
- Keep `models.py` as single source of truth
- Use Django ORM for all database operations

### Don'ts ❌

- Never manually edit migration files (unless you know what you're doing)
- Never modify production database schema directly with SQL
- Never delete migration files that have been applied
- Never use `schema.sql` to create tables (Django handles this)
- Never skip migrations when deploying

### Safety Tips

```bash
# Always check what migrations will run
python manage.py showmigrations

# Dry-run migration (see SQL without applying)
python manage.py sqlmigrate learning 0003

# Backup before major changes
python manage.py dumpdata > backup_$(date +%Y%m%d).json

# Rollback migration (if needed)
python manage.py migrate learning 0002  # Goes back to migration 0002
```

### 常见开发场景

**场景1：首次启动项目**
```bash
./backend-dev.sh  # 一键完成所有配置和启动
```

**场景2：修改了 models.py 文件**
```bash
# Django 开发服务器运行时：
# 1. 按 Ctrl+C 停止服务器
# 2. 运行迁移脚本
./migrate.sh
# 3. 重启服务器
cd backend && source venv/bin/activate && python manage.py runserver

# 或者简单地重新运行
./backend-dev.sh
```

**场景3：开发服务器已在运行，只改了 views.py 或其他非模型文件**
```bash
# 无需任何操作，Django 会自动重载代码
```

**场景4：每天开始工作**
```bash
# 如果服务器已停止
./backend-dev.sh

# 如果只想启动服务器（不重新迁移）
cd backend && source venv/bin/activate && python manage.py runserver
```

---

## Database Schema Management

### Current Schema (via Django ORM)

Our application uses these models defined in `learning/models.py`:

- **Theme**: Main topic categories
- **Section**: Learning sections within themes
- **Concept**: SQL concepts within sections
- **Problem**: Practice problems for each concept
- **UserProgress**: Track user completion status
- **QuerySubmission**: Store user SQL query attempts
- **ChatThread**: AI chatbot conversation sessions
- **ChatMessage**: Individual messages in chat threads

### Model Changes Workflow

```python
# Example: Adding a new field to Problem model
class Problem(models.Model):
    # ... existing fields ...
    difficulty = models.CharField(max_length=20, default='easy')  # New field
```

```bash
# Generate migration
python manage.py makemigrations
# Django asks: "Please select a default for existing rows"
# Option 1: Provide default value
# Option 2: Set null=True temporarily

# Apply migration
python manage.py migrate
```

---

## Quick Reference

| Task | Command | 说明 |
|------|---------|------|
| 启动后端开发环境 | `./backend-dev.sh` | 完整启动（迁移+服务器） |
| 快速迁移（改模型后） | `./migrate.sh` | 仅生成和应用迁移 |
| Create migrations | `python manage.py makemigrations` | 生成迁移文件 |
| Apply migrations | `python manage.py migrate` | 应用迁移到数据库 |
| View migration status | `python manage.py showmigrations` | 查看迁移状态 |
| Run dev server | `python manage.py runserver` | 启动开发服务器 |
| Create superuser | `python manage.py createsuperuser` | 创建管理员账户 |
| Collect static files | `python manage.py collectstatic` | 收集静态文件 |
| Deploy to App Engine | `gcloud app deploy` | 部署到生产环境 |
| SSH to instance | `gcloud app instances ssh [INSTANCE-ID]` | 连接生产服务器 |
| View logs | `gcloud app logs tail` | 查看生产日志 |

---

## Troubleshooting

### Migration Conflicts

```bash
# If migrations are out of sync
python manage.py migrate --fake-initial

# If you need to reset migrations (local only!)
rm learning/migrations/0*.py
python manage.py makemigrations
python manage.py migrate
```

### Connection Issues

```bash
# Test database connection
python manage.py dbshell

# Check Cloud SQL connectivity
gcloud sql instances describe sql-learning-db
```

### Deployment Issues

```bash
# View detailed logs
gcloud app logs read --limit 50

# Check instance health
gcloud app instances list

# Verify environment variables
gcloud app deploy --verbosity=debug
```

