import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, CheckCircle, X, RotateCcw, ChevronRight, ChevronDown, Grid3X3 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import RightPanel from './RightPanel';
import DraggableDivider from './DraggableDivider';
import { conceptAPI, problemAPI } from '../services/api';

const SQLLearningPlatform = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [phase, setPhase] = useState('gallery');
  const [concepts, setConcepts] = useState({ beginner: [], intermediate: [], advanced: [] }); // 后端概念数据按难度分组
  const [currentProblem, setCurrentProblem] = useState(null); // 当前正在练习的问题
  const [selectedConcept, setSelectedConcept] = useState(null); // 当前选中的概念
  const [lastResult, setLastResult] = useState(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [chatMode, setChatMode] = useState('solve');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [viewMode, setViewMode] = useState('gallery');
  const [expandedDifficulties, setExpandedDifficulties] = useState(['beginner']); // 展开的难度级别
  const [isDragging, setIsDragging] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('practice');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => { // 初始化：显示欢迎消息并加载概念数据
    setMessages([{
      id: 1,
      type: 'ai',
      content: 'Welcome to SQL Learning Platform!\n\nChoose a concept from the gallery on the right to start learning SQL fundamentals.\n\nClick on difficulty levels to expand and see available concepts.',
      timestamp: new Date()
    }]);
    loadConcepts();
  }, []);

  const loadConcepts = async () => { // 从后端加载概念数据
    try {
      setIsLoading(true);
      const data = await conceptAPI.getConceptsWithProgress();
      setConcepts(data);
    } catch (error) {
      console.error('Failed to load concepts:', error);
      addMessage('加载概念失败，请刷新页面重试。', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, type = 'ai') => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleDifficulty = (difficulty) => { // 切换难度级别的展开/折叠
    setExpandedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const startConcept = async (concept) => { // 选择概念并开始学习/练习
    setSelectedConcept(concept);
    setCurrentProblem(null);
    setLastResult(null);
    setWaitingForNext(false);
    setViewMode('single');
    setPhase('learning');
    setRightPanelTab('learn');
    
    addMessage(`Starting ${concept.name}!`, 'user');
    
    setTimeout(() => {
      addMessage(`Let's learn about ${concept.name}. Check the Learn tab to understand the concept, then switch to Practice to try some problems!`, 'ai');
    }, 500);
  };

  const startPractice = async () => { // 开始练习：加载或生成问题
    if (!selectedConcept) return;
    
    setRightPanelTab('practice');
    setPhase('practicing');
    addMessage("Let me find a problem for you...", 'ai');
    
    try {
      setIsLoading(true);
      const params = { primary_concept: selectedConcept.name, difficulty: selectedConcept.difficulty_level };
      const response = await problemAPI.getProblems(params);
      
      if (response.results && response.results.length > 0) {
        const problem = response.results[0];
        console.log('[SQLLearningPlatform] 接收到问题数据:', problem); // 日志：接收到的问题数据
        console.log('[SQLLearningPlatform] SQL Schema:', problem.sql_schema); // 日志：SQL Schema内容
        setCurrentProblem(problem);
        setTimeout(() => {
          addMessage("Great! Here's your problem. Try to solve it!", 'ai');
        }, 500);
      } else {
        setTimeout(() => {
          addMessage("No problems available for this concept yet. Would you like me to generate one?", 'ai');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
      addMessage('Failed to load problems. Please try again.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const containerWidth = window.innerWidth;
    const mouseX = e.clientX;
    const newLeftWidth = (mouseX / containerWidth) * 100;
    
    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftPanelWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
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

  const handleNextProblem = async () => { // 加载下一个问题
    setWaitingForNext(false);
    setLastResult(null);
    setCurrentProblem(null);
    addMessage("Let's practice more!", 'user');
    
    try {
      setIsLoading(true);
      const params = { primary_concept: selectedConcept.name };
      const response = await problemAPI.getProblems(params);
      
      if (response.results && response.results.length > 0) {
        const randomProblem = response.results[Math.floor(Math.random() * response.results.length)];
        console.log('[SQLLearningPlatform] 接收到下一个问题:', randomProblem); // 日志：下一个问题数据
        console.log('[SQLLearningPlatform] SQL Schema:', randomProblem.sql_schema); // 日志：SQL Schema内容
        setCurrentProblem(randomProblem);
        setTimeout(() => {
          addMessage("Here's another challenge for you!", 'ai');
        }, 500);
      } else {
        setTimeout(() => {
          addMessage("No more problems available. Try selecting a different concept!", 'ai');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to load next problem:', error);
      addMessage('Failed to load next problem. Please try again.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToGallery = () => { // 返回概念画廊
    setViewMode('gallery');
    setPhase('gallery');
    setSelectedConcept(null);
    setCurrentProblem(null);
    setLastResult(null);
    setWaitingForNext(false);
    addMessage("Back to concept gallery", 'user');
  };

  const handleSubmitAnswer = async () => { // 提交SQL答案
    if (!currentInput.trim()) return;

    const userAnswer = currentInput.trim();
    addMessage(userAnswer, 'user');
    setCurrentInput('');
    
    if (chatMode === 'ask') { // 问答模式：简单回答SQL相关问题
      setTimeout(() => {
        const input = userAnswer.toLowerCase();
        const conceptName = selectedConcept?.name || 'SQL';
        
        if (input.includes('select')) {
          addMessage(`SELECT chooses which columns you want from a table. In ${conceptName}, you use SELECT to specify your data.`, 'ai');
        } else if (input.includes('from')) {
          addMessage("FROM specifies which table to get data from. Always use the correct table name.", 'ai');
        } else if (input.includes('order by')) {
          addMessage("ORDER BY sorts your results. Use ASC for ascending (A-Z, 1-9) or DESC for descending (Z-A, 9-1).", 'ai');
        } else if (input.includes('where')) {
          addMessage("WHERE filters data based on conditions. Use = for exact matches, AND for multiple conditions.", 'ai');
        } else if (input.includes('join')) {
          addMessage("JOIN combines rows from two or more tables based on a related column. INNER JOIN returns matching rows only.", 'ai');
        } else {
          addMessage(`I'm here to help with ${conceptName}! Ask about any SQL concepts.`, 'ai');
        }
      }, 800);
      return;
    }

    // 解题模式：提交答案到后端验证
    if (!currentProblem) {
      addMessage("Please select a problem first!", 'ai');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await problemAPI.submitQuery(currentProblem.id, { sql_code: userAnswer });
      
      setLastResult({
        userQuery: userAnswer,
        isCorrect: response.is_correct,
        message: response.message
      });

      setTimeout(() => {
        if (response.is_correct) {
          addMessage("Correct! Well done. 🎉", 'ai');
          setTimeout(() => {
            addMessage("Would you like to practice more with another problem?", 'ai');
            setWaitingForNext(true);
          }, 1000);
        } else {
          addMessage(response.message || "Incorrect. Please try again.", 'ai');
        }
      }, 500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      addMessage('Failed to submit answer. Please try again.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'single' ? 'gallery' : 'single');
  };

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
      <ChatInterface
        messages={messages}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        handleSubmitAnswer={handleSubmitAnswer}
        chatMode={chatMode}
        setChatMode={setChatMode}
        viewMode={viewMode}
        phase={phase}
        waitingForNext={waitingForNext}
        handleNextProblem={handleNextProblem}
        handleBackToGallery={handleBackToGallery}
        messagesEndRef={messagesEndRef}
        leftPanelWidth={leftPanelWidth}
        isLoading={isLoading}
      />

      {/* Draggable Divider */}
      <DraggableDivider 
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />

      {/* Right Panel */}
      <RightPanel
        viewMode={viewMode}
        rightPanelTab={rightPanelTab}
        setRightPanelTab={setRightPanelTab}
        concepts={concepts}
        expandedDifficulties={expandedDifficulties}
        toggleDifficulty={toggleDifficulty}
        startConcept={startConcept}
        startPractice={startPractice}
        selectedConcept={selectedConcept}
        currentProblem={currentProblem}
        phase={phase}
        toggleViewMode={toggleViewMode}
        handleBackToGallery={handleBackToGallery}
        currentInput={currentInput}
        chatMode={chatMode}
        lastResult={lastResult}
        leftPanelWidth={leftPanelWidth}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SQLLearningPlatform;
