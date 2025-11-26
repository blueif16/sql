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
  const [sqlExecutionResults, setSqlExecutionResults] = useState(null); // SQL execution results for display

  const messagesEndRef = useRef(null);

  useEffect(() => { // Fetch problem data (includes concept info)
    const fetchData = async () => {
      if (!problemId) {
        setError('No problem ID specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Clear previous SQL execution results when loading a new problem
        setSqlExecutionResults(null);
        const problemData = await problemAPI.getProblem(problemId);
        setProblem(problemData);
        setConceptInfo(problemData.concept_info); // Concept info already included
        
        setMessages([{
          id: 1,
          type: 'ai',
          content: `Welcome! This is a problem about ${problemData.primary_concept || 'SQL'}.\n\nPlease read the problem description on the right, then enter your SQL query below.\n\nIf you need help, switch to the Learn tab to view related concepts.`,
          timestamp: new Date()
        }]);
        
      } catch (err) {
        console.error('Failed to fetch problem:', err);
        setError('Failed to load problem, please try again later.');
        setMessages([{
          id: 1,
          type: 'ai',
          content: 'Sorry, there was an error loading the problem.',
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

    if (!queryText) { // If not from AI chat, add message
      addMessage(userAnswer, 'user');
      setCurrentInput('');
    }

    if (chatMode === 'ask' && !queryText) { // Only handle Q&A in non-AI mode
      setTimeout(() => {
        const input = userAnswer.toLowerCase();
        if (input.includes('select')) {
          addMessage(`SELECT is used to choose the columns you want. In ${problem.primary_concept || 'SQL'}, SELECT specifies the data you want to query.`, 'ai');
        } else if (input.includes('from')) {
          addMessage("FROM specifies which table to get data from. Use correct table names like 'customers' or 'products'.", 'ai');
        } else if (input.includes('where')) {
          addMessage("WHERE is used to filter data based on conditions. Use = for exact matches, and AND to combine multiple conditions.", 'ai');
        } else {
          addMessage(`I can help you understand concepts related to ${problem.primary_concept || 'SQL'}! Ask me any questions.`, 'ai');
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
          addMessage("Correct! Well done.", 'ai');
          setCompletedProblems(prev => prev + 1);
          addMessage("Great! You've completed this problem. Try other problems or continue practicing.", 'ai');
          setWaitingForNext(true);
        } else {
          addMessage("Incorrect. Please check the output comparison and try again.", 'ai');
        }
      }, 500);
      
    } catch (err) {
      console.error('Failed to submit query:', err);
      addMessage("Error submitting query, please try again later.", 'ai');
    }
  };

  const handleRetry = () => { // Handle retry action
    setWaitingForNext(false);
    setLastResult(null);
    addMessage("Try again!", 'user');
    setTimeout(() => {
      addMessage("You've got this!", 'ai');
    }, 500);
  };

  const handleSqlResults = (results) => { // Handle SQL execution results
    setSqlExecutionResults(results);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error || 'Problem not found'}</div>
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
          sqlSchema={problem?.sql_schema}
          onSqlResults={handleSqlResults}
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
        sqlExecutionResults={sqlExecutionResults}
      />
    </div>
  );
};

export default ProblemDetailPage;

