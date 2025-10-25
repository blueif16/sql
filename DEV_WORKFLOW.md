# 开发工作流程说明

## 快速开始

### 首次启动项目

#### 使用 Conda 环境（推荐）

```bash
# 1. 激活你的 conda 环境
conda activate your-env-name

# 2. 确保已安装依赖（首次运行）
cd backend
pip install -r requirements.txt
cd ..

# 3. 启动后端
./backend-dev.sh
```

#### 使用系统 Python

```bash
# 在项目根目录
./backend-dev.sh
```

这个脚本会自动完成所有后端初始化工作（迁移、填充数据、启动服务器）。

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端默认已配置连接 `http://localhost:8000/api`，无需额外配置。

---

## 日常开发场景

### 场景1: 修改了 models.py（数据库模型）

**选项A: 使用快速迁移脚本（推荐）**
```bash
# 在项目根目录
./migrate.sh
```

**选项B: 手动执行**
```bash
cd backend
source venv/bin/activate
python manage.py makemigrations  # 生成迁移文件
python manage.py migrate         # 应用迁移
```

**重要**: Django 开发服务器会自动检测代码变更并重载，无需手动重启！

### 场景2: 修改了 views.py、serializers.py 等普通代码

**无需任何操作！** Django 开发服务器会自动重载。

### 场景3: 修改了前端代码

**无需任何操作！** Vite 会自动热更新（HMR）。

### 场景4: 每天开始工作

```bash
# 激活 conda 环境（如果使用 conda）
conda activate your-env-name

# 启动后端（完整流程）
./backend-dev.sh

# 或者只启动服务器（如果数据库已是最新）
cd backend
python manage.py runserver
```

```bash
# 启动前端
cd frontend
npm run dev
```

---

## 常见问题

### Q: 每次修改 model 都要重新运行 backend-dev.sh 吗？

**A: 不需要！** 只需要运行 `./migrate.sh` 进行快速迁移即可。

- `backend-dev.sh`: 完整的启动脚本（迁移、填充数据、启动服务器）
- `migrate.sh`: 仅执行数据库迁移（生成 + 应用）

### Q: 我使用 Conda，需要特殊配置吗？

**A: 不需要！** 脚本会自动检测并使用你当前的 Conda 环境。

工作流程：
1. 激活 conda 环境：`conda activate your-env-name`
2. 运行脚本：`./backend-dev.sh` 或 `./migrate.sh`
3. 脚本会使用当前激活的 conda 环境

### Q: 修改 models.py 后，开发服务器需要重启吗？

**A: 不需要！** 运行迁移后，Django 会自动重载代码。

工作流程：
1. 修改 `learning/models.py`
2. 运行 `./migrate.sh`（或手动执行 makemigrations + migrate）
3. Django 自动重载，新模型立即生效

### Q: 前端如何知道后端是开发模式？

**A: 已经配置好了！** 

前端配置文件 `frontend/src/config/constants.js` 中：
```javascript
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', // 默认开发模式
  IS_DEV: import.meta.env.DEV, // 开发模式标志
};
```

默认连接本地后端，无需额外配置。

---

## 开发脚本说明

### `./start-dev.sh` - 完整开发环境启动
- 启动前端和后端
- 完整的初始化流程
- 适合首次启动或长时间未开发后

### `./backend-dev.sh` - 后端开发启动
- 仅启动后端
- 自动处理迁移、数据填充
- **支持 Conda 和系统 Python**
- 适合后端开发

### `./migrate.sh` - 快速迁移
- 仅执行数据库迁移
- 生成迁移文件 + 应用迁移
- **使用当前 Python 环境（Conda/系统）**
- 适合修改模型后快速更新

---

## 最佳实践

### ✅ 推荐做法
- 修改模型后立即运行 `./migrate.sh`
- 提交代码时包含迁移文件（`learning/migrations/*.py`）
- 使用 `python manage.py showmigrations` 检查迁移状态
- 定期备份数据库：`python manage.py dumpdata > backup.json`

### ❌ 不推荐做法
- 不要手动编辑迁移文件（除非你很清楚在做什么）
- 不要删除已应用的迁移文件
- 不要直接修改数据库表结构（使用 Django ORM）
- 不要跳过迁移步骤

---

## 🚀 日常使用指南

**首次启动（Conda 用户）：**
```bash
conda activate your-env-name  # 激活你的环境
cd backend && pip install -r requirements.txt  # 首次安装依赖
cd .. && ./backend-dev.sh  # 后端
cd frontend && npm run dev  # 前端（新终端）
```

**每次改模型：**
```bash
conda activate your-env-name  # 确保环境已激活
./migrate.sh  # 快速迁移，无需重启
```

**每天开始工作：**
```bash
conda activate your-env-name  # 激活环境
./backend-dev.sh  # 或直接 cd backend && python manage.py runserver
cd frontend && npm run dev
```

---

## 访问地址

开发环境默认地址：
- 前端: http://localhost:5173
- 后端 API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

---

## 更多信息

详细的数据库工作流程和部署指南，请参考：
- [backend/DATABASE_WORKFLOW.md](backend/DATABASE_WORKFLOW.md)

