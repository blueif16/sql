# LeetCode SQL 练习系统 - 前端

专业的SQL学习和练习平台，支持中英文双语，提供个性化的学习体验。

## 🌐 双语支持

系统完全支持中文和英文双语界面：
- **语言选择**: 在入职流程开始时选择首选语言
- **动态切换**: 整个入职流程根据选择的语言动态显示
- **本地化**: 所有文本、按钮、提示均有对应翻译

## 核心功能

### 🚀 主界面编程环境
- **三栏布局**: 题目描述 | 代码编辑器 | AI助手
- **统一主题**: 保持灰色调简洁设计风格
- **代码高亮**: SQL语法高亮和行号显示
- **AI交互**: 实时AI助手帮助解题

### ⚙️ 个性化入职流程 (`/onboarding`)
直接访问入职页面进行个性化配置，包含6个步骤：

#### 第一步：语言选择
- **中文**: 🇨🇳 完整中文界面
- **English**: 🇺🇸 完整英文界面

#### 第二步～第六步：个性化配置

#### 访问路径
- **主编程界面**: `/` - SQL编程练习界面
- **入职流程**: `/onboarding` - 完整的个性化配置流程
- **设置入口**: 点击主界面右上角设置按钮直接进入入职流程
- **完成页面**: `/onboarding/complete` - 设置完成确认

#### 配置项目
1. **难度偏好** (`/onboarding/difficulty`)
   - **Easy/简单**: Perfect for beginners / 适合初学者，基础SQL语法
   - **Medium/中等**: Some experience required / 有一定基础，复合查询  
   - **Hard/困难**: Advanced SQL / 高级SQL，复杂业务逻辑
   - **Adaptive/自适应**: Dynamically adjusts / 根据答题情况动态调整

2. **学习方式** (`/onboarding/learning`)
   - **Guided/引导式**: Step-by-step hints / 逐步提示，详细解释
   - **Challenge/挑战式**: Direct challenges / 直接挑战，自主探索
   - **Step by Step/逐步式**: Progressive learning / 分步骤学习，循序渐进

3. **兴趣领域** (`/onboarding/interests`) 
   - **多选支持**: Movies, Football, E-commerce, Database, System, Entertainment, Sports
   - **中文**: 电影、足球、电商、数据库、系统、娱乐、体育
   - 用于推荐相关主题的SQL练习题

4. **已掌握概念** (`/onboarding/concepts`)
   - SQL概念多选：SELECT、WHERE、JOINS、GROUP_BY、ORDER_BY、SUBQUERIES等
   - 用于个性化题目推荐和难度评估

5. **界面主题** (`/onboarding/theme`)
   - **Light Theme/浅色主题**: Classic white background / 经典白色背景
   - **Dark Theme/深色主题**: Eye-friendly dark mode / 护眼暗色模式

#### 数据存储
所有偏好配置自动保存到数据库preferences表：
```json
{
  "preferences": {
    "difficulty_preference": "easy|medium|hard|adaptive",
    "learning_style": "guided|challenge|step_by_step", 
    "interest_areas": "[\"movie\",\"football\"]",
    "learned_concepts": "[\"SELECT\",\"WHERE\"]",
    "ui_theme": "light|dark"
  }
}
```

## 技术架构

### 核心文件结构
```
lib/
├── i18n-config.ts          # 双语配置和翻译文件
├── onboarding-config.ts    # 入职流程统一配置
└── use-onboarding.ts       # 数据管理hook

app/
├── onboarding/
│   ├── page.tsx            # 主入职流程(含语言选择)
│   ├── [step]/page.tsx     # 动态步骤页面
│   └── complete/page.tsx   # 完成页面
├── page.tsx                # 主编程界面
└── layout.tsx              # 应用布局和中文支持
```

### 开发特性
- ⚡ **极致码高尔夫风格**: 最少行数实现功能
- 🎯 **统一配置管理**: 所有变量集中在config文件
- 🌐 **完整双语支持**: 中英文界面动态切换
- 🔄 **响应式设计**: 适配各种屏幕尺寸
- ⚙️ **类型安全**: 完整的TypeScript类型定义
- 🚀 **智能路由**: 自动重定向和流程控制

## 开始使用

首先安装依赖并启动开发服务器：

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 功能测试
1. **主界面**: 访问 `http://localhost:3000` - 完整的SQL编程环境
2. **设置入口**: 点击主界面右上角设置图标进入入职流程
3. **入职流程**: 访问 `http://localhost:3000/onboarding` - 完整个性化配置
4. **语言测试**: 
   - 选择🇨🇳中文：界面显示完全中文
   - 选择🇺🇸English：界面显示完全英文
5. **数据验证**: 查看浏览器控制台输出的数据库格式数据

### 主要页面
- `/` - 主编程界面（SQL编辑器 + AI助手）
- `/onboarding` - 完整入职流程（语言选择 + 5步配置）
- `/onboarding/complete` - 配置完成确认页面

### 设计特色
- **统一主题**: 保持原有灰白色调的简洁设计风格
- **无缝集成**: 入职流程和主界面视觉风格完全统一
- **便捷访问**: 主界面设置按钮直接链接到入职流程

## 性能优化
- 组件懒加载和代码分割
- 统一状态管理，避免重复渲染
- 优化的图标和字体加载
- 响应式图片和样式优化
