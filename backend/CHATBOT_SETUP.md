# AI聊天机器人设置指南

本指南帮助你快速设置和使用集成的Google Gemini AI聊天机器人。

## 快速开始

### 1. 获取Google API密钥

1. 访问 [Google AI Studio](https://ai.google.dev/)
2. 使用Google账号登录
3. 点击 "Get API Key" 创建新的API密钥
4. 复制生成的API密钥

### 2. 配置后端

#### 设置环境变量

编辑 `.env` 文件（如果没有，从 `env.example` 复制）：

```bash
# 必需配置
GOOGLE_API_KEY=your-google-api-key-here

# 可选配置
GEMINI_MODEL=gemini-2.0-flash-exp  # 使用的模型
CHAT_MAX_TOKENS=65                 # 历史消息最大token数
CHAT_TEMPERATURE=0.7               # 生成温度（0-1）
```

#### 运行数据库迁移

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

这将创建聊天相关的数据库表：
- `ChatThread`: 存储聊天会话
- `ChatMessage`: 存储对话消息

### 3. 配置前端

前端配置在 `frontend/src/config/constants.js`：

```javascript
export const CHAT_CONFIG = {
  USE_AI_CHATBOT: true,      // 启用AI聊天机器人
  USE_STREAMING: true,        // 使用流式响应
  STORAGE_KEY: 'sql_platform_chat_thread',
  DEFAULT_LANGUAGE: 'zh',     // 默认语言
};
```

### 4. 启动服务

#### 启动后端
```bash
cd backend
python manage.py runserver
```

#### 启动前端
```bash
cd frontend
npm run dev
```

## 功能使用

### 题目页面聊天

1. 进入任意题目详情页（ProblemDetailPage）
2. 左侧显示AI聊天机器人界面
3. 选择模式：
   - **问答模式**：询问SQL相关问题
   - **解题模式**：输入SQL查询并提交

### API使用示例

#### 非流式响应

```javascript
import { chatAPI } from './services/api';

const response = await chatAPI.sendMessage({
  message: "什么是SELECT语句？",
  thread_id: "optional-thread-id",
  problem_id: 1,  // 可选，关联题目
  language: "zh"
});

console.log(response.message); // AI回复
console.log(response.thread_id); // 会话ID
```

#### 流式响应

```javascript
await chatAPI.streamMessage(
  {
    message: "解释一下GROUP BY",
    problem_id: 1,
    language: "zh"
  },
  (chunk) => {
    // 接收到文本块
    console.log(chunk);
  },
  () => {
    // 流式响应完成
    console.log("Done");
  },
  (error) => {
    // 错误处理
    console.error(error);
  }
);
```

## 系统架构

### 后端（Django）

```
learning/
├── models.py
│   ├── ChatThread      # 聊天会话模型
│   └── ChatMessage     # 消息模型
├── chatbot.py
│   ├── ChatbotConfig   # 配置类
│   └── SQLChatbot      # 聊天机器人服务
├── views.py
│   └── ChatViewSet     # 聊天API视图
└── serializers.py
    ├── ChatThreadSerializer
    ├── ChatMessageSerializer
    └── ChatRequestSerializer
```

### 前端（React）

```
frontend/src/
├── components/
│   └── AIChatInterface.jsx    # AI聊天组件
├── services/
│   └── api.js                 # 包含chatAPI
├── config/
│   └── constants.js           # 包含CHAT_CONFIG
└── pages/
    └── ProblemDetailPage.jsx  # 集成聊天界面
```

## 工作流程

### 1. 用户发送消息

```
用户输入 -> AIChatInterface -> chatAPI.streamMessage() -> POST /api/chat/stream/
```

### 2. 后端处理

```
ChatViewSet.stream()
    ↓
SQLChatbot.chat_stream()
    ↓
创建/获取 ChatThread
    ↓
保存用户消息 (ChatMessage)
    ↓
加载题目上下文（如果有）
    ↓
准备历史消息（自动修剪）
    ↓
调用 Google Gemini API
    ↓
流式返回响应
    ↓
保存AI回复 (ChatMessage)
```

### 3. 前端显示

```
SSE Stream -> 接收chunks -> 更新UI -> 显示完整响应
```

## 数据模型

### ChatThread（聊天会话）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| thread_id | String | 唯一会话标识 |
| user | ForeignKey | 用户（可为空） |
| problem | ForeignKey | 关联题目（可为空） |
| language | String | 语言设置 |
| is_active | Boolean | 是否活跃 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### ChatMessage（聊天消息）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| thread | ForeignKey | 所属会话 |
| message_type | String | 消息类型（human/ai/system） |
| content | Text | 消息内容 |
| metadata | JSON | 元数据 |
| created_at | DateTime | 创建时间 |

## 配置参数说明

### GEMINI_MODEL
可选的模型：
- `gemini-2.0-flash-exp` (推荐，快速)
- `gemini-1.5-pro` (更强大)
- `gemini-1.5-flash` (平衡)

### CHAT_MAX_TOKENS
- 控制历史消息的最大token数
- 默认65，适合短对话
- 增加可以记住更多历史，但会增加成本

### CHAT_TEMPERATURE
- 控制生成的随机性
- 0: 确定性，相同输入得到相同输出
- 1: 创造性，输出更多样化
- 推荐0.7：平衡准确性和多样性

## 故障排查

### API密钥错误
```
ValueError: GOOGLE_API_KEY environment variable not set
```
**解决**: 确保在`.env`文件中设置了`GOOGLE_API_KEY`

### 流式响应不工作
**检查**:
1. 浏览器支持SSE (Server-Sent Events)
2. CORS设置正确
3. 前端`CHAT_CONFIG.USE_STREAMING = true`

### 对话历史丢失
**原因**: localStorage被清空或thread_id不匹配
**解决**: 检查浏览器localStorage中的`sql_platform_chat_thread_*`键

### Token超限错误
```
Error: Token limit exceeded
```
**解决**: 
1. 减少`CHAT_MAX_TOKENS`值
2. 系统会自动修剪历史消息
3. 考虑清空对话重新开始

## 性能优化

### 1. 使用流式响应
- 用户体验更好
- 减少等待时间
- 实时显示进度

### 2. 消息历史管理
- 自动修剪旧消息
- 控制token使用
- 平衡记忆和成本

### 3. 缓存策略
- 相同问题可以缓存回复
- 减少API调用
- 降低成本

## 成本估算

Google Gemini API定价（截至2024）：
- Gemini 2.0 Flash: 免费额度较高
- 输入: $0.075 / 1M tokens
- 输出: $0.30 / 1M tokens

估算：
- 单次对话: ~100-500 tokens
- 每天100次对话: $0.01-0.05
- 每月成本: ~$0.50-2.00（低流量）

## 安全建议

1. **保护API密钥**
   - 不要提交到版本控制
   - 使用环境变量
   - 定期轮换密钥

2. **速率限制**
   - 实现API调用限制
   - 防止滥用
   - 监控使用量

3. **内容过滤**
   - 验证用户输入
   - 过滤敏感信息
   - 记录异常行为

4. **用户认证**
   - 要求登录使用
   - 追踪用户使用情况
   - 实施配额管理

## 扩展功能

### 添加更多提示词模板

编辑 `backend/learning/chatbot.py`：

```python
SYSTEM_PROMPTS = {
    'zh': """你是SQL学习助手...""",
    'en': """You are an SQL tutor...""",
    'advanced': """你是高级SQL专家...""",  # 新增
}
```

### 支持更多模型

```python
# chatbot.py
class ChatbotConfig:
    MODELS = {
        'fast': 'gemini-2.0-flash-exp',
        'smart': 'gemini-1.5-pro',
        'balanced': 'gemini-1.5-flash',
    }
```

### 添加对话分析

```python
# 保存对话统计
class ChatAnalytics(models.Model):
    thread = models.ForeignKey(ChatThread)
    total_messages = models.IntegerField()
    avg_response_time = models.FloatField()
    user_satisfaction = models.IntegerField()
```

## 维护

### 清理旧对话

```bash
python manage.py shell
```

```python
from learning.models import ChatThread
from datetime import timedelta
from django.utils import timezone

# 删除30天前的非活跃会话
old_date = timezone.now() - timedelta(days=30)
ChatThread.objects.filter(
    updated_at__lt=old_date,
    is_active=False
).delete()
```

### 监控使用情况

```python
# 查看统计
from learning.models import ChatMessage
from django.db.models import Count

# 每日消息数
ChatMessage.objects.filter(
    created_at__date=timezone.now().date()
).count()

# 活跃用户数
ChatThread.objects.filter(
    is_active=True
).values('user').distinct().count()
```

## 技术支持

如有问题，请：
1. 查看日志：`backend/logs/` 
2. 检查控制台错误
3. 参考Google Gemini文档：https://ai.google.dev/docs
4. 提交Issue到项目仓库

## 更新日志

### v1.0.0 (2024-01-17)
- ✅ 集成Google Gemini API
- ✅ 支持流式响应
- ✅ 对话历史管理
- ✅ 题目上下文感知
- ✅ 双模式支持（问答/解题）
- ✅ 多语言支持

