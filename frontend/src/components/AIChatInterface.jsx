import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, CheckCircle, RotateCcw, Bot, User, Loader } from 'lucide-react';
import { chatAPI } from '../services/api';
import { CHAT_CONFIG, UI_TEXTS } from '../config/constants'; // 导入UI文本配置
import { useLanguage } from '../hooks/useLanguage'; // 导入语言钩子

const AIChatInterface = ({
  problemId = null, // 关联的题目ID
  leftPanelWidth = 50, // 左侧面板宽度
  onQuerySubmit = null, // SQL查询提交回调
}) => {
  const { language } = useLanguage(); // 获取当前语言
  const t = UI_TEXTS[language].aiChat; // 获取当前语言的文本配置
  const [messages, setMessages] = useState([]); // 消息列表
  const [currentInput, setCurrentInput] = useState(''); // 当前输入
  const [threadId, setThreadId] = useState(null); // 会话ID
  const [isLoading, setIsLoading] = useState(false); // 加载状态
  const [isStreaming, setIsStreaming] = useState(false); // 流式响应状态
  const [chatMode, setChatMode] = useState('ask'); // 聊天模式: ask或solve
  const messagesEndRef = useRef(null);

  useEffect(() => { // 初始化会话
    const storedThreadId = localStorage.getItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`);
    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadHistory(storedThreadId);
    } else if (problemId) {
      initializeProblemChat(); // 如果有problemId但没有会话，创建新会话
    } else {
      fetchWelcomeMessage(); // 从后端获取欢迎消息
    }
  }, [problemId]);

  const initializeProblemChat = async () => { // 初始化带问题上下文的会话
    try {
      setIsLoading(true);
      const response = await chatAPI.sendMessage({
        message: t.initProblemMessage,
        thread_id: null,
        problem_id: problemId,
        language: CHAT_CONFIG.DEFAULT_LANGUAGE
      });
      
      const newThreadId = response.thread_id;
      setThreadId(newThreadId);
      localStorage.setItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`, newThreadId);
      
      setMessages([
        {
          id: Date.now(),
          type: 'user',
          content: t.initProblemMessage,
          timestamp: new Date()
        },
        {
          id: response.message_id || Date.now() + 1,
          type: 'ai',
          content: response.message,
          timestamp: new Date(response.created_at || new Date())
        }
      ]);
    } catch (error) {
      console.error('Failed to initialize problem chat:', error);
      fetchWelcomeMessage();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWelcomeMessage = async () => { // 从后端获取欢迎消息
    try {
      setIsLoading(true);
      const welcomeMessageText = problemId 
        ? t.welcomeWithProblem
        : t.welcomeGeneral;
      
      const response = await chatAPI.sendMessage({
        message: welcomeMessageText,
        thread_id: null,
        problem_id: problemId,
        language: CHAT_CONFIG.DEFAULT_LANGUAGE
      });
      
      const newThreadId = response.thread_id;
      setThreadId(newThreadId);
      localStorage.setItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`, newThreadId);
      
      setMessages([
        {
          id: response.message_id || Date.now(),
          type: 'ai',
          content: response.message,
          timestamp: new Date(response.created_at || new Date())
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch welcome message:', error);
      // 回退到默认欢迎消息
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: problemId 
          ? t.fallbackWelcomeWithProblem
          : t.fallbackWelcomeGeneral,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (tid) => { // 加载历史消息
    try {
      const data = await chatAPI.getHistory(tid);
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map(msg => ({
          id: msg.id,
          type: msg.type === 'human' ? 'user' : 'ai',
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        fetchWelcomeMessage();
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      fetchWelcomeMessage();
    }
  };

  const scrollToBottom = () => { // 滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, type = 'ai', id = null) => { // 添加消息
    const newMessage = {
      id: id || Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateLastMessage = (content) => { // 更新最后一条消息
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1].content = content;
      }
      return newMessages;
    });
  };

  const handleSendMessage = async () => { // 发送消息
    if (!currentInput.trim() || isLoading || isStreaming) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    addMessage(userMessage, 'user');

    if (chatMode === 'solve' && onQuerySubmit) { // 如果是解题模式且有回调，调用提交SQL
      onQuerySubmit(userMessage);
      setTimeout(() => {
        addMessage(t.querySubmitted, 'ai');
      }, 500);
      return;
    }

    const requestData = {
      message: userMessage,
      thread_id: threadId,
      problem_id: problemId,
      language: CHAT_CONFIG.DEFAULT_LANGUAGE
    };

    if (CHAT_CONFIG.USE_STREAMING) { // 使用流式响应
      setIsStreaming(true);
      const streamingMessageId = Date.now();
      addMessage('', 'ai', streamingMessageId);
      
      let fullResponse = '';
      
      await chatAPI.streamMessage(
        requestData,
        (chunk) => { // 接收到数据块
          fullResponse += chunk;
          updateLastMessage(fullResponse);
        },
        () => { // 流式响应完成
          setIsStreaming(false);
          if (!threadId && fullResponse) { // 保存新的线程ID
            const newThreadId = `thread_${Date.now()}`;
            setThreadId(newThreadId);
            localStorage.setItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`, newThreadId);
          }
        },
        (error) => { // 流式响应错误
          console.error('Streaming error:', error);
          setIsStreaming(false);
          updateLastMessage(t.errorMessage);
        }
      );
    } else { // 使用非流式响应
      setIsLoading(true);
      try {
        const response = await chatAPI.sendMessage(requestData);
        addMessage(response.message, 'ai', response.message_id);
        
        if (response.thread_id && !threadId) {
          setThreadId(response.thread_id);
          localStorage.setItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`, response.thread_id);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        addMessage(t.errorMessage, 'ai');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => { // 处理键盘事件
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col relative h-full" style={{ width: `${leftPanelWidth}%` }}>
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 tiny-scrollbar" style={{ paddingBottom: '80px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* 头像 */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-gray-600' : 'bg-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              
              {/* 消息内容 */}
              <div className={`px-4 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-blue-50 text-gray-900 border border-blue-100'
              }`}>
                <div className="text-sm whitespace-pre-wrap break-words font-normal">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 加载指示器 */}
        {(isLoading || isStreaming) && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Loader size={16} className="animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">{t.thinking}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          {/* 模式切换按钮 */}
          {problemId && onQuerySubmit && (
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => setChatMode('ask')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  chatMode === 'ask' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <BookOpen size={14} className="inline mr-1" />
                {t.modeAsk}
              </button>
              <button
                onClick={() => setChatMode('solve')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  chatMode === 'solve' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <CheckCircle size={14} className="inline mr-1" />
                {t.modeSolve}
              </button>
            </div>
          )}
          
          {/* 输入框 */}
          <div className="flex gap-2">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={chatMode === 'solve' ? t.placeholderSolve : t.placeholderAsk}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                minHeight: '40px',
                maxHeight: '120px',
              }}
              rows={1}
              disabled={isLoading || isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isLoading || isStreaming}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              {t.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;

