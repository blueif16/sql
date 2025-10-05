import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, CheckCircle, X, RotateCcw, ChevronRight, ChevronDown, Grid3X3 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import RightPanel from './RightPanel';
import DraggableDivider from './DraggableDivider';
import { themes } from '../data/themes';
import { getSections } from '../utils/sections';
import { executeValidQuery, generateUserOutput } from '../utils/queryExecutor';

const SQLLearningPlatform = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [phase, setPhase] = useState('gallery');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showTheoryNotification, setShowTheoryNotification] = useState(false);
  const [showProblemNotification, setShowProblemNotification] = useState(false);
  const [completedProblems, setCompletedProblems] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [chatMode, setChatMode] = useState('solve');
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [showSectionTransition, setShowSectionTransition] = useState(false);
  const [viewMode, setViewMode] = useState('gallery');
  const [expandedSections, setExpandedSections] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState('practice');
  const [currentTheme, setCurrentTheme] = useState('default');
  
  const messagesEndRef = useRef(null);

  const getCurrentThemeData = () => themes[currentTheme] || themes.default;

  useEffect(() => {
    setMessages([{
      id: 1,
      type: 'ai',
      content: 'Welcome to SQL Learning Platform!\n\nChoose a concept from the gallery on the right to start learning SQL fundamentals.\n\nClick on sections to expand and see available concepts.',
      timestamp: new Date()
    }]);
  }, []);

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

  const toggleSection = (sectionIndex) => {
    setExpandedSections(prev => 
      prev.includes(sectionIndex) 
        ? prev.filter(s => s !== sectionIndex)
        : [...prev, sectionIndex]
    );
  };

  const jumpToConcept = (sectionIndex, conceptIndex) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentConceptIndex(conceptIndex);
    setCurrentProblemIndex(0);
    setCompletedProblems(0);
    setLastResult(null);
    setWaitingForNext(false);
    setViewMode('single');
    setPhase('problems');
    setShowTheoryNotification(true);
    setShowProblemNotification(true);
    setRightPanelTab('practice');
    
    const sections = getSections(currentTheme);
    const conceptName = sections[sectionIndex].concepts[conceptIndex].name;
    addMessage(`Starting ${conceptName}!`, 'user');
    
    setTimeout(() => {
      addMessage("Great choice! Your first challenge is ready. Check the hint if you need help!", 'ai');
    }, 500);
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

  const handleNextTask = () => {
    setWaitingForNext(false);
    setLastResult(null);
    addMessage("Let's practice more!", 'user');
    
    setTimeout(() => {
      addMessage("Here's another challenge for you!", 'ai');
    }, 500);
  };

  const handleNextConcept = () => {
    const sections = getSections(currentTheme);
    const currentSection = sections[currentSectionIndex];
    
    let nextSectionIndex = currentSectionIndex;
    let nextConceptIndex = currentConceptIndex + 1;
    
    if (nextConceptIndex >= currentSection.concepts.length) {
      nextSectionIndex++;
      nextConceptIndex = 0;
    }
    
    if (nextSectionIndex < sections.length) {
      setWaitingForNext(false);
      setLastResult(null);
      setCurrentSectionIndex(nextSectionIndex);
      setCurrentConceptIndex(nextConceptIndex);
      setCurrentProblemIndex(0);
      setCompletedProblems(0);
      setRightPanelTab('practice');
      addMessage("Starting new concept!", 'user');
      
      setTimeout(() => {
        addMessage("Here's your first challenge with this new concept!", 'ai');
      }, 500);
    } else {
      setPhase('completed');
      addMessage("Perfect! You've mastered all SQL concepts!", 'ai');
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentInput.trim()) return;

    const userAnswer = currentInput.trim();
    addMessage(userAnswer, 'user');
    setCurrentInput('');
    
    if (viewMode === 'gallery' || chatMode === 'ask') {
      setTimeout(() => {
        const input = userAnswer.toLowerCase();
        const sections = getSections(currentTheme);
        const currentConcept = sections[currentSectionIndex].concepts[currentConceptIndex].name;
        
        if (input.includes('select')) {
          addMessage(`SELECT chooses which columns you want from a table. In ${currentConcept}, you use SELECT to specify your data.`, 'ai');
        } else if (input.includes('from')) {
          addMessage("FROM specifies which table to get data from. Always use the correct table name like 'customers' or 'products'.", 'ai');
        } else if (input.includes('order by')) {
          addMessage("ORDER BY sorts your results. Use ASC for ascending (A-Z, 1-9) or DESC for descending (Z-A, 9-1).", 'ai');
        } else if (input.includes('where')) {
          addMessage("WHERE filters data based on conditions. Use = for exact matches, AND for multiple conditions.", 'ai');
        } else if (input.includes('distinct')) {
          addMessage("DISTINCT removes duplicate rows from your results. Use SELECT DISTINCT column_name to get unique values only.", 'ai');
        } else {
          addMessage(`I'm here to help with ${currentConcept}! Ask about any SQL concepts.`, 'ai');
        }
      }, 800);
      return;
    }

    const sections = getSections(currentTheme);
    const currentSection = sections[currentSectionIndex];
    const currentConcept = currentSection.concepts[currentConceptIndex];
    const currentProblem = currentConcept.problems[currentProblemIndex];
    const userOutput = generateUserOutput(userAnswer, currentTheme);
    const expectedOutput = currentProblem.expectedOutput;
    
    const isCorrect = JSON.stringify(userOutput) === JSON.stringify(expectedOutput);
    
    setLastResult({
      userQuery: userAnswer,
      userOutput,
      expectedOutput,
      isCorrect
    });

    setTimeout(() => {
      if (isCorrect) {
        addMessage("Correct! Well done.", 'ai');
        const newCompletedProblems = completedProblems + 1;
        setCompletedProblems(newCompletedProblems);
        
        addMessage("Great job! Would you like to practice more with another problem, or move to the next concept?", 'ai');
        setWaitingForNext(true);
      } else {
        addMessage("Incorrect. Check the output comparison.", 'ai');
      }
    }, 500);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'single' ? 'gallery' : 'single');
  };

  return (
    <div className="h-screen bg-gray-50 flex select-none">
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
        handleNextTask={handleNextTask}
        handleNextConcept={handleNextConcept}
        messagesEndRef={messagesEndRef}
        leftPanelWidth={leftPanelWidth}
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
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        sections={getSections(currentTheme)}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        jumpToConcept={jumpToConcept}
        currentSectionIndex={currentSectionIndex}
        currentConceptIndex={currentConceptIndex}
        currentProblemIndex={currentProblemIndex}
        showProblemNotification={showProblemNotification}
        phase={phase}
        toggleViewMode={toggleViewMode}
        currentInput={currentInput}
        chatMode={chatMode}
        lastResult={lastResult}
        leftPanelWidth={leftPanelWidth}
      />
    </div>
  );
};

export default SQLLearningPlatform;
