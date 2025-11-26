"""
Chatbot service using Google Gemini API.
"""

import uuid
import logging
from typing import List, Dict, Optional, Generator
from decouple import config  # 使用decouple读取.env文件
from openai import OpenAI
import google.generativeai as genai
from .models import ChatThread, ChatMessage, Problem, Concept

logger = logging.getLogger(__name__)


class ChatbotConfig:
    """聊天机器人配置常量"""
    GOOGLE_API_KEY = config('GOOGLE_API_KEY', default='')  # Google API密钥（从.env文件读取）
    MODEL_NAME = config('GEMINI_MODEL', default='gemini-2.5-flash')  # Gemini模型名称
    TEMPERATURE = float(config('CHAT_TEMPERATURE', default='0.7'))  # 生成温度
    DEFAULT_LANGUAGE = 'en'  # 默认语言
    
    SYSTEM_PROMPT = """You are a professional SQL learning assistant helping users learn and master SQL. Your responsibilities are:

1. Answer SQL-related questions with clear and understandable explanations
2. Help users understand SQL concepts and syntax
3. Analyze users' SQL queries, point out errors and provide improvement suggestions
4. Provide practical SQL programming tips and best practices
5. Provide targeted guidance based on the problem information and concept descriptions provided
6. When converting natural language to SQL, ONLY generate SELECT statements. Never generate CREATE TABLE, INSERT, UPDATE, DELETE, or any DDL statements.

When users ask questions, combine the problem requirements and concept knowledge to answer.
If users submit SQL queries, help analyze their correctness and provide specific improvement suggestions.
When asked to convert natural language to SQL, always respond with ONLY a SELECT statement that can be executed on existing tables.
Please respond in a concise and friendly manner, using code examples when appropriate."""


class SQLChatbot:
    """SQL学习聊天机器人"""

    def __init__(self):
        if not ChatbotConfig.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable not set")  # API密钥未设置

        genai.configure(api_key=ChatbotConfig.GOOGLE_API_KEY)  # 配置Google Gemini
        self.client = genai.GenerativeModel(ChatbotConfig.MODEL_NAME)  # 初始化Gemini客户端
    
    def get_or_create_thread(self, thread_id: Optional[str] = None, 
                            user=None, problem_id: Optional[int] = None,
                            language: str = ChatbotConfig.DEFAULT_LANGUAGE) -> ChatThread:
        """获取或创建聊天线程"""
        if thread_id:
            try:
                thread = ChatThread.objects.get(thread_id=thread_id)
                thread.updated_at = thread.updated_at  # 触发更新
                thread.save()
                return thread
            except ChatThread.DoesNotExist:
                pass
        
        thread_id = thread_id or str(uuid.uuid4())  # 生成新线程ID
        problem = Problem.objects.filter(id=problem_id).first() if problem_id else None  # 获取关联题目
        
        thread = ChatThread.objects.create(
            thread_id=thread_id,
            user=user,
            problem=problem,
            language=language
        )
        
        return thread
    
    def _build_context(self, thread: ChatThread) -> str:
        """Build context with problem and concept information"""
        context_parts = []
        language = thread.language or ChatbotConfig.DEFAULT_LANGUAGE
        
        if thread.problem:
            problem = thread.problem
            context_parts.append("=== Current Problem ===")
            context_parts.append(f"Title: {problem.title}")
            context_parts.append(f"Description: {problem.description}")
            context_parts.append(f"Difficulty: {problem.difficulty}")
            context_parts.append(f"Primary Concept: {problem.primary_concept}")
            
            if problem.sql_schema:
                context_parts.append(f"Schema: {problem.sql_schema}")
            
            try:
                concept = Concept.objects.get(name=problem.primary_concept, is_active=True)
                # 根据语言选择本地化字段
                concept_name = concept.name_en if language == 'en' and concept.name_en else (concept.name_zh if language == 'zh' and concept.name_zh else concept.name)
                concept_description = concept.description_en if language == 'en' and concept.description_en else (concept.description_zh if language == 'zh' and concept.description_zh else concept.description)
                
                context_parts.append("\n=== Concept Explanation ===")
                context_parts.append(f"Concept: {concept_name}")
                context_parts.append(f"Details: {concept_description}")
                context_parts.append(f"Level: {concept.difficulty_level}")
                if concept.prerequisites:
                    context_parts.append(f"Prerequisites: {', '.join(concept.prerequisites)}")
            except Concept.DoesNotExist:
                pass
        
        return "\n".join(context_parts) if context_parts else ""
    
    def _trim_messages(self, messages: List[ChatMessage]) -> List[ChatMessage]:
        """修剪消息历史，保留最近的消息"""
        if not messages:
            return []
        
        trimmed = []

        for msg in reversed(messages):  # 从最新消息开始
            trimmed.insert(0, msg)
        
        return trimmed
    
    def _prepare_history(self, thread: ChatThread) -> List[Dict[str, str]]:
        """准备对话历史"""
        messages = list(thread.messages.all())
        trimmed_messages = self._trim_messages(messages)  # 修剪历史消息
        
        history = []
        for msg in trimmed_messages:
            if msg.message_type == 'human':
                history.append({'role': 'user', 'content': msg.content})
            elif msg.message_type == 'ai':
                history.append({'role': 'assistant', 'content': msg.content})
        
        return history
    
    def chat(self, message: str, thread_id: Optional[str] = None,
             user=None, problem_id: Optional[int] = None,
             language: str = ChatbotConfig.DEFAULT_LANGUAGE) -> Dict[str, any]:
        """同步聊天（非流式）"""
        thread = self.get_or_create_thread(thread_id, user, problem_id, language)  # 获取或创建线程
        
        ChatMessage.objects.create(  # 保存用户消息
            thread=thread,
            message_type='human',
            content=message
        )
        
        # 添加语言指示
        language_instruction = "Please respond in English." if language == "en" else "请用中文回答。"
        system_prompt = f"{language_instruction}\n\n{ChatbotConfig.SYSTEM_PROMPT}"
        context = self._build_context(thread)  # 构建包含问题和概念信息的上下文
        
        if context:
            system_prompt = f"{system_prompt}\n\n{context}"
        
        history = self._prepare_history(thread)  # 准备历史对话
        previous_history = history[:-1] if history else []  # 排除刚添加的用户消息
        
        # 构建消息历史
        history = []
        if previous_history:
            for msg in previous_history:
                history.append({
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [msg["content"]]
                })

        # 创建聊天会话
        chat = self.client.start_chat(history=history)

        # 构建完整提示
        full_prompt = f"{system_prompt}\n\nUser: {message}"

        response = chat.send_message(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=ChatbotConfig.TEMPERATURE
            )
        )

        ai_content = response.text

        # Log AI response content for debugging SQL generation
        logger.info(f"[Chatbot] AI Response Content: {ai_content}")

        ai_message = ChatMessage.objects.create(  # 保存AI回复
            thread=thread,
            message_type='ai',
            content=ai_content,
            metadata={
                'model': ChatbotConfig.MODEL_NAME,
                'provider': 'gemini'
            }
        )
        
        return {
            'thread_id': thread.thread_id,
            'message': ai_message.content,
            'message_id': ai_message.id,
            'created_at': ai_message.created_at.isoformat()
        }
    
    def chat_stream(self, message: str, thread_id: Optional[str] = None,
                    user=None, problem_id: Optional[int] = None,
                    language: str = ChatbotConfig.DEFAULT_LANGUAGE) -> Generator[str, None, None]:
        """流式聊天"""
        thread = self.get_or_create_thread(thread_id, user, problem_id, language)  # 获取或创建线程
        
        ChatMessage.objects.create(  # 保存用户消息
            thread=thread,
            message_type='human',
            content=message
        )
        
        # 添加语言指示
        language_instruction = "Please respond in English." if language == "en" else "请用中文回答。"
        system_prompt = f"{language_instruction}\n\n{ChatbotConfig.SYSTEM_PROMPT}"
        context = self._build_context(thread)  # 构建包含问题和概念信息的上下文
        
        if context:
            system_prompt = f"{system_prompt}\n\n{context}"
        
        history = self._prepare_history(thread)  # 准备历史对话
        previous_history = history[:-1] if history else []  # 排除刚添加的用户消息
        
        # 构建消息历史
        history = []
        if previous_history:
            for msg in previous_history:
                history.append({
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [msg["content"]]
                })

        # 创建聊天会话
        chat = self.client.start_chat(history=history)

        # 构建完整提示
        full_prompt = f"{system_prompt}\n\nUser: {message}"

        full_response = []

        response = chat.send_message(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=ChatbotConfig.TEMPERATURE
            ),
            stream=True
        )

        for chunk in response:
            if chunk.text:
                content = chunk.text
                full_response.append(content)
                yield content
        
        full_content = ''.join(full_response)

        # Log streaming AI response content for debugging SQL generation
        logger.info(f"[Chatbot] Streaming AI Response Content: {full_content}")

        ChatMessage.objects.create(  # 保存完整的AI回复
            thread=thread,
            message_type='ai',
            content=full_content,
            metadata={
                'model': ChatbotConfig.MODEL_NAME,
                'provider': 'gemini',
                'streaming': True
            }
        )
    
    def get_thread_history(self, thread_id: str) -> List[Dict[str, any]]:
        """获取线程历史"""
        try:
            thread = ChatThread.objects.get(thread_id=thread_id)
            messages = thread.messages.all()
            
            return [{
                'id': msg.id,
                'type': msg.message_type,
                'content': msg.content,
                'timestamp': msg.created_at.isoformat()
            } for msg in messages]
        except ChatThread.DoesNotExist:
            return []

