# SQL Learning Platform - Frontend

基于 React + Vite 构建的 SQL 学习平台前端应用。

## 技术栈

- React 18
- Vite
- Tailwind CSS
- Axios

## 功能特性

### 1. 学习模式
- 交互式 SQL 学习界面
- 分章节、概念的系统化学习
- 实时查询预览
- 主题切换（Default / Harry Potter）

### 2. 问题详情页 🆕
访问 `/problem?id=xxx` 查看单个题目的详细信息。

#### 特点：
- **练习标签（Practice）**：显示题目描述、表格数据、实时查询结果
- **学习标签（Learn）**：根据题目的 `primary_concept` 从 concept 表获取概念详情，包括：
  - 概念说明
  - 语法示例
  - 使用要点
  - 实际示例代码
- **交互式聊天**：支持"解题模式"和"提问模式"
- **实时查询验证**：即时查看 SQL 查询结果并与期望输出对比

#### 使用方法：
```javascript
// 在应用中导航到问题页（使用 react-router-dom）
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/problem?id=123');

// 或使用封装的导航函数
handleNavigate(ROUTES.PROBLEM, { problemId: '123' });

// 或直接访问 URL
http://localhost:5173/problem?id=123
```

### 3. 个人信息页
查看用户统计信息、提交历史等。

## 项目架构 🏗️

项目采用清晰的页面-组件分离架构：

```
src/
├── pages/              # 页面组件（路由级别）
│   ├── HomePage.jsx             # 主页（学习平台）
│   ├── ProblemDetailPage.jsx   # 问题详情页 🆕
│   ├── ProfilePage.jsx          # 个人信息页
│   └── index.js                 # 页面导出
├── components/         # 可复用组件
│   ├── SQLLearningPlatform.jsx  # SQL 学习平台核心组件
│   ├── ProblemRightPanel.jsx    # 问题页右侧面板
│   ├── ProblemLearnTab.jsx      # 问题页学习标签
│   ├── ChatInterface.jsx        # 聊天界面
│   ├── PracticeTab.jsx          # 练习标签
│   ├── LearnTab.jsx             # 学习标签
│   ├── DataTable.jsx            # 数据表格
│   ├── GalleryView.jsx          # 画廊视图
│   ├── RightPanel.jsx           # 右侧面板
│   ├── NavBar.jsx               # 导航栏
│   ├── ProfilePage.jsx          # 个人信息组件
│   └── DraggableDivider.jsx     # 可拖动分隔线
├── config/
│   └── constants.js     # 配置常量（路由、主题、难度等）
├── services/
│   └── api.js          # API 接口封装
├── utils/              # 工具函数
│   ├── queryExecutor.js # SQL 查询执行器
│   └── sections.js      # 章节数据处理
├── data/               # 本地数据
│   ├── mysql-concepts.json  # MySQL 概念数据
│   └── themes.js            # 主题配置
├── App.jsx             # 应用主入口（路由配置）
└── main.jsx            # React 入口

```

### 架构设计原则

1. **页面-组件分离**: `pages/` 存放路由级别的页面，`components/` 存放可复用组件
2. **路由驱动**: 使用 `react-router-dom` 管理路由，清晰的 URL 结构
3. **组件组合**: 页面通过组合组件实现功能，保持组件单一职责
4. **配置集中**: 所有常量统一在 `config/constants.js` 管理
5. **API 封装**: 后端接口统一在 `services/api.js` 封装

## API 接口

### 问题相关
```javascript
// 获取单个问题详情
problemAPI.getProblem(id)

// 提交 SQL 查询
problemAPI.submitQuery(id, { query, user_output })
```

### 概念相关 🆕
```javascript
// 根据概念名获取概念详情
conceptAPI.getConceptInfo(concept)
```

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 路由说明

使用 `react-router-dom` 管理路由：

| 路由 | 页面组件 | 描述 |
|------|---------|------|
| `/` | `HomePage` | 主页（SQL 学习平台） |
| `/profile` | `ProfilePage` | 个人信息页 |
| `/problem?id=xxx` | `ProblemDetailPage` | 问题详情页 🆕 |
| `*` | `HomePage` | 404 重定向到主页 |

## 环境配置

### 开发模式（默认）

前端默认配置连接本地后端开发服务器：
- API 地址: `http://localhost:8000/api`
- 配置位置: `src/config/constants.js`

```javascript
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', // 默认为开发模式
  IS_DEV: import.meta.env.DEV, // 开发模式标志
};
```

### 自定义 API 地址（可选）

如果需要连接不同的后端地址，可以创建 `.env` 文件：

```bash
# .env
VITE_API_BASE_URL=http://your-custom-backend:8000/api
```

### 生产环境

构建生产版本时，设置环境变量：

```bash
VITE_API_BASE_URL=https://your-app-id.appspot.com/api npm run build
```

## 注意事项

- ✅ 默认配置已适配开发模式，无需额外配置
- ✅ 所有 API 请求会自动连接到配置的后端地址
- 问题的 `sql_schema` 字段应为 JSON 格式的表格数据
- 概念信息从后端 `concept` 表动态获取，支持自定义概念内容
