import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, CheckCircle, RotateCcw, Bot, User, Loader, Play, X, CheckCircle2, XCircle } from 'lucide-react';
import { chatAPI } from '../services/api';
import { CHAT_CONFIG, UI_TEXTS } from '../config/constants'; // Import UI text configuration
import { useLanguage } from '../hooks/useLanguage'; // Import language hook
import SQLTable from '../../components/SQLTable'; // Import SQLTable component

const AIChatInterface = ({
  problemId = null, // Associated problem ID
  leftPanelWidth = 50, // Left panel width
  onQuerySubmit = null, // SQL query submission callback
  sqlSchema = '', // SQL schema for data setup
  onSqlResults = null, // SQL execution results callback
}) => {
  const { language } = useLanguage(); // Get current language
  const t = UI_TEXTS[language].aiChat; // Get current language text configuration
  const [messages, setMessages] = useState([]); // Message list
  const [currentInput, setCurrentInput] = useState(''); // Current input
  const [threadId, setThreadId] = useState(null); // Session ID
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isStreaming, setIsStreaming] = useState(false); // Streaming response state
  const [chatMode, setChatMode] = useState('ask'); // Chat mode: ask or solve
  const [internalSqlSchema, setInternalSqlSchema] = useState(''); // SQL schema for execution
  const [sqlResults, setSqlResults] = useState(null); // SQL execution results
  const [isExecutingSQL, setIsExecutingSQL] = useState(false); // SQL execution state
  const [sqlManager, setSqlManager] = useState(null); // SQL manager instance
  const [evaluationResult, setEvaluationResult] = useState(null); // Evaluation result (correct/wrong + explanation)
  const [showEvaluationOverlay, setShowEvaluationOverlay] = useState(false); // Show evaluation overlay
  const [isEvaluating, setIsEvaluating] = useState(false); // Evaluation loading state
  const messagesContainerRef = useRef(null);
  const sqlTableRef = useRef(null); // Reference to SQLTable component

  useEffect(() => { // Initialize session
    const storedThreadId = localStorage.getItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`);
    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadHistory(storedThreadId);
    } else if (problemId) {
      initializeProblemChat(); // If there's a problemId but no session, create new session
    } else {
      fetchWelcomeMessage(); // Get welcome message from backend
    }
  }, [problemId]);

  useEffect(() => { // Set SQL schema
    if (sqlSchema) {
      setInternalSqlSchema(sqlSchema);
    }
  }, [sqlSchema]);

  const initializeProblemChat = async () => { // Initialize session with problem context
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

  const fetchWelcomeMessage = async () => { // Get welcome message from backend
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
      // Fallback to default welcome message
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

  const loadHistory = async (tid) => { // Load chat history
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

  const scrollToTop = () => { // Scroll to top
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToTop();
  }, [messages]);

  const addMessage = (content, type = 'ai', id = null) => { // Add message
    const newMessage = {
      id: id || Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateLastMessage = (content) => { // Update last message
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        newMessages[newMessages.length - 1].content = content;
      }
      return newMessages;
    });
  };

  const handleSQLTableReady = (manager) => { // SQLTable ready callback
    setSqlManager(manager);
    console.log('SQL manager ready for execution');
  };

  const handleSendMessage = async () => { // Send message
    if (!currentInput.trim() || isLoading || isStreaming || isExecutingSQL) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    addMessage(userMessage, 'user');

    if (chatMode === 'solve' && problemId) { // If solve mode, evaluate the SQL solution
      await handleSolutionEvaluation(userMessage);
      return;
    }

    if (chatMode === 'execute' && sqlSchema) { // If execute mode, try to execute SQL or translate natural language
      await handleSQLExecution(userMessage);
      return;
    }

    const requestData = {
      message: userMessage,
      thread_id: threadId,
      problem_id: problemId,
      language: CHAT_CONFIG.DEFAULT_LANGUAGE
    };

    if (CHAT_CONFIG.USE_STREAMING) { // Use streaming response
      setIsStreaming(true);
      const streamingMessageId = Date.now();
      addMessage('', 'ai', streamingMessageId);

      let fullResponse = '';

      await chatAPI.streamMessage(
        requestData,
        (chunk) => { // Received data chunk
          fullResponse += chunk;
          updateLastMessage(fullResponse);
        },
        () => { // Streaming response completed
          setIsStreaming(false);
          if (!threadId && fullResponse) { // Save new thread ID
            const newThreadId = `thread_${Date.now()}`;
            setThreadId(newThreadId);
            localStorage.setItem(`${CHAT_CONFIG.STORAGE_KEY}_${problemId || 'general'}`, newThreadId);
          }
        },
        (error) => { // Streaming response error
          console.error('Streaming error:', error);
          setIsStreaming(false);
          updateLastMessage(t.errorMessage);
        }
      );
    } else { // Use non-streaming response
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

  const handleSQLExecution = async (userMessage) => { // Handle SQL execution
    setIsExecutingSQL(true);

    try {
      let sqlToExecute = userMessage;

      // Check if it's a natural language query (doesn't contain SQL keywords)
      const isNaturalLanguage = !/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|GROUP|ORDER|HAVING|LIMIT)\b/i.test(userMessage);

      if (isNaturalLanguage) {
        // Translate natural language to SQL
        addMessage('Converting natural language to SQL query...', 'ai');

        const translationRequest = {
          message: `Convert the following natural language query to a SQL SELECT statement only. Do NOT generate CREATE TABLE, INSERT, UPDATE, DELETE, or any other DDL/DML statements. Only return the SELECT query that can be executed on the existing database.

Database schema:\n\n${internalSqlSchema}\n\nNatural language query: ${userMessage}\n\nReturn ONLY the SELECT statement, no explanations or markdown formatting.`,
          thread_id: threadId,
          problem_id: problemId,
          language: CHAT_CONFIG.DEFAULT_LANGUAGE
        };

        console.log('SQL Translation Request:', translationRequest);
        const translationResponse = await chatAPI.sendMessage(translationRequest);
        console.log('SQL Translation Response:', translationResponse);
        console.log('Backend returned SQL:', translationResponse.message);

        sqlToExecute = translationResponse.message;

        // Extract SQL statement (remove possible markdown code blocks)
        sqlToExecute = sqlToExecute.replace(/```sql\s*/i, '').replace(/```\s*$/, '').trim();

        console.log('Extracted SQL to execute:', sqlToExecute);
        addMessage(`Generated SQL query:\n\`\`\`sql\n${sqlToExecute}\n\`\`\``, 'ai');
      }

      // Execute SQL query
      addMessage('Executing SQL query...', 'ai');

      if (sqlManager) {
        console.log('SQL Manager available, tables:', sqlManager.tables);

        // Ensure schema is loaded - only load on first execution
        if (internalSqlSchema && !sqlManager.tables.size) {
          console.log('Loading schema for first time:', internalSqlSchema);
          try {
            sqlManager.runSQL(internalSqlSchema);
            console.log('Schema loaded successfully');
          } catch (error) {
            console.warn('Schema loading failed (might already exist):', error.message);
            // Try to continue anyway
          }
        }

        // Check if it's a SELECT query
        const trimmedSQL = sqlToExecute.trim().toUpperCase();
        const isSelectQuery = trimmedSQL.startsWith('SELECT');

        // Additional check: ensure no DDL statements
        const hasDDLStatements = /\b(CREATE|DROP|ALTER|INSERT|UPDATE|DELETE)\b/i.test(sqlToExecute);

        console.log('SQL validation:', {
          startsWithSELECT: isSelectQuery,
          hasDDLStatements: hasDDLStatements,
          sqlPreview: sqlToExecute.substring(0, 100) + '...'
        });

        if (!isSelectQuery || hasDDLStatements) {
          addMessage('Only SELECT queries are supported in execution mode. DDL statements (CREATE, DROP, ALTER, INSERT, UPDATE, DELETE) are not allowed. Please provide a SELECT statement.', 'ai');
          console.error('Rejected SQL execution - not a SELECT query or contains DDL:', sqlToExecute);
          return;
        }

        console.log('Executing SELECT query:', sqlToExecute);

        console.log('About to execute SQL command:', sqlToExecute);
        console.log('SQL command type check - starts with SELECT:', sqlToExecute.trim().toUpperCase().startsWith('SELECT'));

        // 执行查询
        const results = sqlManager.queryAsObjects(sqlToExecute);
        console.log('Query results:', results);

        // 传递结果给父组件用于右侧面板显示
        if (onSqlResults) {
          const sqlResultsData = {
            columns: results && results.length > 0 ? Object.keys(results[0]) : [],
            data: results || [],
            sqlQuery: sqlToExecute,
            timestamp: new Date()
          };
          onSqlResults(sqlResultsData);
        }

        // 格式化结果
        if (results && results.length > 0) {
          const columns = Object.keys(results[0]);
          const formattedResults = results.slice(0, 10); // 限制显示前10行

          let resultMessage = `Query results (showing first ${formattedResults.length} rows):\n\n`;
          resultMessage += `| ${columns.join(' | ')} |\n`;
          resultMessage += `| ${columns.map(() => '---').join(' | ')} |\n`;

          formattedResults.forEach(row => {
            resultMessage += `| ${columns.map(col => String(row[col] || 'NULL')).join(' | ')} |\n`;
          });

          if (results.length > 10) {
            resultMessage += `\n... and ${results.length - 10} more rows`;
          }

          addMessage(resultMessage, 'ai');
        } else {
          addMessage('Query executed successfully, but returned no data.', 'ai');
        }
      } else {
        addMessage('SQL execution environment not initialized, please try again later.', 'ai');
      }

    } catch (error) {
      console.error('SQL execution error:', error);
      addMessage(`SQL execution error: ${error.message}`, 'ai');
    } finally {
      setIsExecutingSQL(false);
    }
  };

  const handleSolutionEvaluation = async (userSolution) => { // Handle solution evaluation
    setIsEvaluating(true);

    try {
      const evaluationData = {
        problem_id: problemId,
        user_solution: userSolution,
        language: CHAT_CONFIG.DEFAULT_LANGUAGE
      };

      console.log('Evaluating solution:', evaluationData);
      const result = await chatAPI.evaluateSolution(evaluationData);
      console.log('Evaluation result:', result);

      setEvaluationResult(result);
      setShowEvaluationOverlay(true);

    } catch (error) {
      console.error('Evaluation error:', error);
      addMessage(`Evaluation failed: ${error.message || 'Unknown error'}`, 'ai');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleKeyDown = (e) => { // Handle keyboard events
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
    <div className="flex flex-col relative h-full" style={{ width: `${leftPanelWidth}%` }}>
      {/* Hidden SQLTable for execution */}
      <div style={{ display: 'none' }}>
        <SQLTable
          ref={sqlTableRef}
          sqlCode={sqlSchema}
          autoExecute={false}
          onReady={handleSQLTableReady}
        />
      </div>

      {/* Message list */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 tiny-scrollbar" style={{ paddingBottom: '80px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-gray-600' : 'bg-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              
              {/* Message content */}
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
        
        {/* Loading indicator */}
        {(isLoading || isStreaming || isExecutingSQL || isEvaluating) && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
              <Loader size={16} className="animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">
                {isEvaluating ? 'Evaluating your solution...' :
                 isExecutingSQL ? 'Executing SQL query...' : t.thinking}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          {/* Mode toggle buttons */}
          {problemId && (
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
              {onQuerySubmit && (
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
              )}
              {sqlSchema && (
                <button
                  onClick={() => setChatMode('execute')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    chatMode === 'execute'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Play size={14} className="inline mr-1" />
                  Execute SQL
                </button>
              )}
            </div>
          )}
          
          {/* Input box */}
          <div className="flex gap-2">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                chatMode === 'solve' ? t.placeholderSolve :
                chatMode === 'execute' ? 'Enter SQL query or natural language description...' :
                t.placeholderAsk
              }
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
              disabled={!currentInput.trim() || isLoading || isStreaming || isExecutingSQL}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              {t.send}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Evaluation Result Overlay */}
    {showEvaluationOverlay && evaluationResult && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t.evaluationTitle || 'Solution Evaluation'}
              </h2>
              <button
                onClick={() => setShowEvaluationOverlay(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className={`mb-6 p-4 rounded-lg border-2 ${
              evaluationResult.is_correct
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {evaluationResult.is_correct ? (
                  <CheckCircle2 size={32} className="text-green-600" />
                ) : (
                  <XCircle size={32} className="text-red-600" />
                )}
                <div>
                  <h3 className={`text-lg font-semibold ${
                    evaluationResult.is_correct ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {evaluationResult.is_correct
                      ? (t.correctTitle || 'Correct Solution!')
                      : (t.incorrectTitle || 'Incorrect Solution')}
                  </h3>
                  <p className={`text-sm ${
                    evaluationResult.is_correct ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {evaluationResult.problem_title}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {t.explanation || 'Explanation'}:
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {evaluationResult.explanation}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEvaluationOverlay(false);
                  setEvaluationResult(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.close || 'Close'}
              </button>
              {!evaluationResult.is_correct && (
                <button
                  onClick={() => {
                    setShowEvaluationOverlay(false);
                    setEvaluationResult(null);
                    setChatMode('ask');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t.askForHelp || 'Ask for Help'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AIChatInterface;

