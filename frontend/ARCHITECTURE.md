# Frontend 架构说明

## 架构概述

本项目采用现代化的 React 单页应用（SPA）架构，使用 `react-router-dom` 进行路由管理，实现了清晰的页面-组件分离模式。

## 目录结构

```
frontend/
├── src/
│   ├── pages/              # 页面层（路由级别组件）
│   │   ├── HomePage.jsx            # 主页 - 学习平台入口
│   │   ├── ProblemDetailPage.jsx  # 问题详情页 - 单题练习
│   │   ├── ProfilePage.jsx        # 个人信息页 - 用户统计
│   │   └── index.js               # 页面统一导出
│   │
│   ├── components/         # 组件层（可复用组件）
│   │   ├── SQLLearningPlatform.jsx  # 核心学习平台组件
│   │   ├── ProblemRightPanel.jsx    # 问题页右侧面板
│   │   ├── ProblemLearnTab.jsx      # 问题页学习标签
│   │   ├── ChatInterface.jsx        # 聊天交互界面
│   │   ├── PracticeTab.jsx          # 练习标签
│   │   ├── LearnTab.jsx             # 学习标签
│   │   ├── RightPanel.jsx           # 右侧面板
│   │   ├── GalleryView.jsx          # 概念画廊视图
│   │   ├── DataTable.jsx            # 数据表格展示
│   │   ├── NavBar.jsx               # 导航栏
│   │   ├── ProfilePage.jsx          # 个人信息组件
│   │   └── DraggableDivider.jsx     # 可拖动分隔线
│   │
│   ├── services/           # 服务层（API 调用）
│   │   └── api.js          # 统一 API 接口封装
│   │
│   ├── config/             # 配置层
│   │   └── constants.js    # 全局常量配置
│   │
│   ├── utils/              # 工具层
│   │   ├── queryExecutor.js  # SQL 查询执行器
│   │   └── sections.js       # 章节数据处理
│   │
│   ├── data/               # 数据层
│   │   ├── mysql-concepts.json  # MySQL 概念数据
│   │   └── themes.js            # 主题配置
│   │
│   ├── App.jsx             # 应用根组件（路由配置）
│   ├── main.jsx            # 应用入口
│   ├── App.css             # 全局样式
│   └── index.css           # 基础样式
│
├── public/                 # 静态资源
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite 构建配置
└── README.md               # 项目说明文档
```

## 架构分层

### 1. 页面层 (Pages)

**职责**: 路由级别的页面组件，负责数据获取和状态管理

- **HomePage**: 主学习平台页面，展示所有概念和交互式学习环境
- **ProblemDetailPage**: 单个问题的详情页面，包含题目、概念学习和实时验证
- **ProfilePage**: 用户个人信息和统计数据展示

**特点**:
- 每个页面对应一个路由
- 负责页面级别的数据获取（API 调用）
- 管理页面状态
- 组合多个组件构建完整页面

### 2. 组件层 (Components)

**职责**: 可复用的 UI 组件，专注于展示和用户交互

**核心组件**:
- `SQLLearningPlatform`: SQL 学习平台的主体组件
- `ChatInterface`: 交互式聊天界面
- `PracticeTab`: 练习模式标签页
- `LearnTab`: 学习模式标签页
- `DataTable`: 数据表格展示组件

**特点**:
- 高度可复用
- 通过 props 接收数据和回调
- 无路由逻辑
- 单一职责原则

### 3. 服务层 (Services)

**职责**: 封装所有后端 API 调用

**api.js** 包含:
- `userAPI`: 用户相关接口（登录、注册、个人信息）
- `problemAPI`: 问题相关接口（获取题目、提交查询）
- `conceptAPI`: 概念相关接口（获取概念详情）
- `themeAPI`: 主题相关接口
- `sectionAPI`: 章节相关接口
- `statsAPI`: 统计数据接口

**特点**:
- 统一的 axios 实例配置
- 自动添加认证 token
- 统一的错误处理
- 响应数据自动解包

### 4. 配置层 (Config)

**constants.js** 包含:
- `APP_CONFIG`: 应用基础配置
- `USER_CONFIG`: 用户相关配置
- `ROUTES`: 路由路径定义
- `DIFFICULTY_LEVELS`: 难度级别定义
- `DIFFICULTY_COLORS`: 难度颜色映射
- `UI_CONFIG`: UI 交互配置
- `THEME_CONFIG`: 主题配置

**特点**:
- 所有常量集中管理
- 避免魔法字符串
- 易于维护和修改

### 5. 工具层 (Utils)

**职责**: 提供通用的工具函数

- `queryExecutor.js`: SQL 查询执行和结果生成
- `sections.js`: 章节数据处理和获取

### 6. 数据层 (Data)

**职责**: 本地静态数据存储

- `mysql-concepts.json`: MySQL 概念和练习题数据
- `themes.js`: 主题配置数据

## 路由架构

使用 `react-router-dom v6` 管理路由：

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/problem" element={<ProblemDetailPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="*" element={<HomePage />} />
  </Routes>
</BrowserRouter>
```

**路由特点**:
- 声明式路由配置
- 支持查询参数（如 `/problem?id=123`）
- 404 自动重定向到主页
- 使用 `useNavigate` 和 `useSearchParams` hooks

## 数据流

```
用户操作
  ↓
页面组件 (Pages)
  ↓
服务层 (Services/API)
  ↓
后端服务器
  ↓
响应数据
  ↓
页面组件更新状态
  ↓
子组件重新渲染 (Components)
```

## 状态管理

当前使用 React 内置的状态管理：
- `useState`: 组件本地状态
- `useEffect`: 副作用处理（数据获取、订阅）
- `useRef`: DOM 引用和持久化值
- Props drilling: 通过 props 传递状态和回调

**未来可扩展**:
- 引入 Redux/Zustand 进行全局状态管理
- 使用 React Query 管理服务端状态

## 样式方案

- **Tailwind CSS**: 原子化 CSS 框架，快速构建 UI
- **内联样式**: 特殊场景的自定义样式
- **CSS Modules**: 可选，用于组件级别样式隔离

## 组件通信

1. **父子组件**: 通过 props 传递数据和回调
2. **跨层级组件**: Props drilling（小规模）或 Context API（大规模）
3. **路由参数**: URL 查询参数传递页面状态

## 最佳实践

1. **组件职责单一**: 每个组件只负责一个功能
2. **页面组合组件**: 页面通过组合多个小组件构建
3. **配置集中管理**: 所有常量在 constants.js 中定义
4. **API 统一封装**: 所有接口调用通过 api.js
5. **注释清晰**: 所有变量和函数都有行内注释
6. **中文友好**: 用户界面和提示都使用中文
7. **性能优化**: 合理使用 memo、useMemo、useCallback

## 开发流程

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/pages/index.js` 导出页面
3. 在 `src/config/constants.js` 添加路由常量
4. 在 `src/App.jsx` 添加路由配置
5. 更新 README.md 文档

### 添加新组件

1. 在 `src/components/` 创建组件
2. 保持组件可复用和单一职责
3. 通过 props 接收数据和回调
4. 添加清晰的注释

### 添加新 API

1. 在 `src/services/api.js` 相应的 API 对象中添加方法
2. 添加清晰的行内注释
3. 遵循统一的命名规范

## 性能优化

1. **代码分割**: 使用 React.lazy 和 Suspense 按需加载页面
2. **组件记忆化**: 使用 React.memo 避免不必要的重渲染
3. **回调记忆化**: 使用 useCallback 缓存事件处理函数
4. **值记忆化**: 使用 useMemo 缓存计算结果
5. **虚拟滚动**: 长列表使用虚拟滚动技术

## 测试策略

- **单元测试**: 使用 Vitest 测试工具函数和组件
- **集成测试**: 测试页面级别的功能
- **E2E 测试**: 使用 Playwright/Cypress 测试完整流程

## 部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到生产环境
# dist/ 目录包含所有静态资源
```

## 技术栈

- **React 19**: UI 框架
- **React Router v6**: 路由管理
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架
- **Axios**: HTTP 客户端
- **Lucide React**: 图标库

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

