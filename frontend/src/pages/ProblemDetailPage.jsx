import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import AIChatInterface from '../components/AIChatInterface';
import ProblemRightPanel from '../components/ProblemRightPanel';
import DraggableDivider from '../components/DraggableDivider';
import { problemAPI } from '../services/api';
import { generateUserOutput } from '../utils/queryExecutor';
import { CHAT_CONFIG } from '../config/constants';

const ProblemDetailPage = ({ currentTheme, onThemeChange }) => { // Problem detail page
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('id'); // Get problem ID from URL query parameter
  
  const [messages, setMessages] = useState([]); // Chat messages
  const [currentInput, setCurrentInput] = useState(''); // Current input text
  const [problem, setProblem] = useState(null); // Problem data
  const [conceptInfo, setConceptInfo] = useState(null); // Concept information
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error message
  const [lastResult, setLastResult] = useState(null); // Last query result
  const [waitingForNext, setWaitingForNext] = useState(false); // Waiting for next action
  const [chatMode, setChatMode] = useState('solve'); // Chat mode: solve or ask
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Left panel width percentage
  const [isDragging, setIsDragging] = useState(false); // Dragging state
  const [rightPanelTab, setRightPanelTab] = useState('practice'); // Right panel tab: practice or learn
  const [completedProblems, setCompletedProblems] = useState(0); // Number of completed problems
  
  const messagesEndRef = useRef(null);

  useEffect(() => { // Fetch problem data (includes concept info)
    const fetchData = async () => {
      if (!problemId) {
        setError('未指定题目 ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const problemData = await problemAPI.getProblem(problemId);
        setProblem(problemData);
        setConceptInfo(problemData.concept_info); // Concept info already included
        
        setMessages([{
          id: 1,
          type: 'ai',
          content: `欢迎！这是一道关于 ${problemData.primary_concept || 'SQL'} 的题目。\n\n仔细阅读右侧的题目描述，然后在下方输入你的 SQL 查询。\n\n如果需要帮助，可以切换到 Learn 标签查看相关概念。`,
          timestamp: new Date()
        }]);
        
      } catch (err) {
        console.error('Failed to fetch problem:', err);
        setError('加载题目失败，请稍后重试。');
        setMessages([{
          id: 1,
          type: 'ai',
          content: '抱歉，加载题目时出错了。',
          timestamp: new Date()
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [problemId]);

  const scrollToBottom = () => { // Scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, type = 'ai') => { // Add message to chat
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMouseMove = (e) => { // Handle mouse move for dragging divider
    if (!isDragging) return;
    
    const containerWidth = window.innerWidth;
    const mouseX = e.clientX;
    const newLeftWidth = (mouseX / containerWidth) * 100;
    
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftPanelWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => { // Handle mouse up for dragging divider
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSubmitAnswer = async (queryText = null) => { // Handle answer submission
    const userAnswer = queryText || currentInput.trim();
    if (!userAnswer || !problem) return;

    if (!queryText) { // 如果不是从AI聊天传入的，添加消息
      addMessage(userAnswer, 'user');
      setCurrentInput('');
    }
    
    if (chatMode === 'ask' && !queryText) { // 仅在非AI模式下处理问答
      setTimeout(() => {
        const input = userAnswer.toLowerCase();
        if (input.includes('select')) {
          addMessage(`SELECT 用于选择你想要的列。在 ${problem.primary_concept || 'SQL'} 中，SELECT 指定你要查询的数据。`, 'ai');
        } else if (input.includes('from')) {
          addMessage("FROM 指定从哪个表获取数据。使用正确的表名，如 'customers' 或 'products'。", 'ai');
        } else if (input.includes('where')) {
          addMessage("WHERE 用于根据条件筛选数据。使用 = 进行精确匹配，使用 AND 组合多个条件。", 'ai');
        } else {
          addMessage(`我可以帮你理解 ${problem.primary_concept || 'SQL'} 的相关概念！问我任何问题吧。`, 'ai');
        }
      }, 800);
      return;
    }

    try {
      const userOutput = generateUserOutput(userAnswer, currentTheme);
      
      const result = await problemAPI.submitQuery(problemId, {
        query: userAnswer,
        user_output: userOutput
      });
      
      const isCorrect = result.is_correct;
      
      setLastResult({
        userQuery: userAnswer,
        userOutput,
        expectedOutput: result.expected_output,
        isCorrect
      });

      setTimeout(() => {
        if (isCorrect) {
          addMessage("正确！做得好。", 'ai');
          setCompletedProblems(prev => prev + 1);
          addMessage("太棒了！你已经完成这道题目。可以尝试其他题目，或者继续练习。", 'ai');
          setWaitingForNext(true);
        } else {
          addMessage("不正确。请检查输出对比，再试一次。", 'ai');
        }
      }, 500);
      
    } catch (err) {
      console.error('Failed to submit query:', err);
      addMessage("提交查询时出错，请稍后重试。", 'ai');
    }
  };

  const handleRetry = () => { // Handle retry action
    setWaitingForNext(false);
    setLastResult(null);
    addMessage("再试一次！", 'user');
    setTimeout(() => {
      addMessage("加油！你可以的！", 'ai');
    }, 500);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || '未找到题目'}</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex select-none">
      <style>{`
        .tiny-scrollbar::-webkit-scrollbar {
          width: 1px;
          height: 1px;
        }
        .tiny-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .tiny-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 1px;
        }
        .tiny-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .tiny-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .custom-textarea:focus {
          outline: none !important;
          box-shadow: 0 0 0 1px #9ca3af !important;
          border-color: #9ca3af !important;
        }
        .line-numbers {
          background: #f9fafb;
          border: 1px solid #d1d5db;
          border-right: none;
          border-radius: 0.375rem 0 0 0.375rem;
          padding: 8px 4px 8px 8px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: #6b7280;
          user-select: none;
          white-space: pre-line;
          text-align: right;
          min-width: 35px;
          overflow: hidden;
        }
        .code-textarea {
          border-radius: 0 0.375rem 0.375rem 0 !important;
          border-left: none !important;
        }
      `}</style>

      {/* Left Panel - Chat */}
      {CHAT_CONFIG.USE_AI_CHATBOT ? (
        <AIChatInterface
          problemId={problemId}
          leftPanelWidth={leftPanelWidth}
          onQuerySubmit={handleSubmitAnswer}
        />
      ) : (
        <ChatInterface
          messages={messages}
          currentInput={currentInput}
          setCurrentInput={setCurrentInput}
          handleSubmitAnswer={handleSubmitAnswer}
          chatMode={chatMode}
          setChatMode={setChatMode}
          viewMode="single"
          phase="problems"
          waitingForNext={waitingForNext}
          handleNextTask={handleRetry}
          handleNextConcept={handleRetry}
          messagesEndRef={messagesEndRef}
          leftPanelWidth={leftPanelWidth}
        />
      )}

      {/* Draggable Divider */}
      <DraggableDivider 
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />

      {/* Right Panel */}
      <ProblemRightPanel
        problem={problem}
        conceptInfo={conceptInfo}
        rightPanelTab={rightPanelTab}
        setRightPanelTab={setRightPanelTab}
        currentInput={currentInput}
        chatMode={chatMode}
        lastResult={lastResult}
        leftPanelWidth={leftPanelWidth}
      />
    </div>
  );
};

export default ProblemDetailPage;

