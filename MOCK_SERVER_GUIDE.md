# Mock Server 快速启动指南

无需数据库，快速体验完整功能的AI聊天机器人。

## 🚀 快速开始

### 1. 后端启动（Mock Server）

```bash
cd backend

# 安装依赖（仅需Flask、CORS和Gemini）
pip install -r requirements-mock.txt

# 设置API密钥
export GOOGLE_API_KEY=your-google-api-key-here

# 启动mock服务器
python mock_server.py
```

服务器将在 `http://localhost:8000` 启动

### 2. 前端启动

```bash
cd frontend

# 如果还没安装依赖
npm install

# 启动前端
npm run dev
```

前端将在 `http://localhost:5173` 启动

## ✅ 功能验证

### 测试API端点

1. **获取问题**: http://localhost:8000/api/problems/1/
2. **聊天消息**: POST http://localhost:8000/api/chat/message/
3. **流式聊天**: POST http://localhost:8000/api/chat/stream/

### 测试前端

1. 访问 http://localhost:5173
2. 进入题目页面（使用 ?id=1）
3. 左侧聊天界面即可使用AI助手

## 📊 Mock数据

### 模拟题目
```json
{
  "id": 1,
  "task": "查询所有用户的姓名和邮箱",
  "table_name": "users",
  "table_data": [
    {"id": 1, "name": "张三", "email": "zhangsan@example.com", "age": 25},
    {"id": 2, "name": "李四", "email": "lisi@example.com", "age": 30},
    {"id": 3, "name": "王五", "email": "wangwu@example.com", "age": 28}
  ],
  "expected_output": [
    {"name": "张三", "email": "zhangsan@example.com"},
    {"name": "李四", "email": "lisi@example.com"},
    {"name": "王五", "email": "wangwu@example.com"}
  ]
}
```

## 🔧 配置

### 环境变量

```bash
# 必需
export GOOGLE_API_KEY=your-key-here

# 可选（mock server使用默认值）
# GEMINI_MODEL=gemini-2.0-flash-exp
# CHAT_MAX_TOKENS=65
# CHAT_TEMPERATURE=0.7
```

### 前端配置

确保 `frontend/src/config/constants.js` 中：
```javascript
export const APP_CONFIG = {
  API_BASE_URL: 'http://localhost:8000/api',  // Mock server地址
};

export const CHAT_CONFIG = {
  USE_AI_CHATBOT: true,
  USE_STREAMING: true,
  DEFAULT_LANGUAGE: 'zh',
};
```

## 📝 示例对话

### 问答模式
```
用户: "什么是SELECT语句？"
AI: "SELECT是SQL中用于查询数据的基本语句..."
```

### 解题模式
```
用户: "SELECT name, email FROM users"
系统: ✅ 正确！
```

## 🎯 Mock Server特点

### 保留完整代码
- ✅ 完整的聊天机器人逻辑
- ✅ Google Gemini API集成
- ✅ 流式响应支持
- ✅ 消息历史管理
- ✅ 上下文感知

### 简化部分
- ✅ 使用内存存储（无需数据库）
- ✅ Flask替代Django（更轻量）
- ✅ 内置模拟数据
- ✅ 即开即用

## 🔄 切换到完整版

当需要完整的Django版本时：

```bash
cd backend

# 安装完整依赖
pip install -r requirements.txt

# 配置数据库
python manage.py migrate

# 启动Django服务器
python manage.py runserver
```

然后更新前端配置中的API地址即可。

## 💡 使用场景

1. **快速演示**: 无需配置数据库，快速展示功能
2. **开发测试**: 前端开发时的mock后端
3. **功能验证**: 验证AI聊天机器人集成
4. **学习参考**: 理解完整实现逻辑

## 🐛 故障排查

### 问题: Chat功能不工作
**检查**: GOOGLE_API_KEY是否设置
```bash
echo $GOOGLE_API_KEY
```

### 问题: 前端连接失败
**检查**: API_BASE_URL是否正确
- Mock server: `http://localhost:8000/api`
- Django server: `http://localhost:8000/api`

### 问题: CORS错误
**解决**: Mock server已配置CORS，确保前端运行在5173端口

## 📦 文件说明

- `mock_server.py`: 独立的Flask服务器（200行）
- `requirements-mock.txt`: 最小依赖（3个包）
- 完整代码仍在: `learning/chatbot.py`, `learning/views.py`等

## 🎉 总结

Mock Server提供：
- ✅ 零配置启动
- ✅ 完整功能演示
- ✅ 真实AI对话
- ✅ 快速迭代开发

完整版本提供：
- ✅ 数据库持久化
- ✅ 用户管理
- ✅ 完整Admin
- ✅ 生产环境就绪

根据需求选择即可！


