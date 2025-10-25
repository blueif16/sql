import React from 'react';
import { Send, BookOpen, CheckCircle, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // 用于渲染markdown格式的聊天机器人回复

const ChatInterface = ({
  messages,
  currentInput,
  setCurrentInput,
  handleSubmitAnswer,
  chatMode,
  setChatMode,
  viewMode,
  phase,
  waitingForNext,
  handleNextProblem,
  handleBackToGallery,
  messagesEndRef,
  leftPanelWidth,
  isLoading
}) => {
  return (
    <div className="flex flex-col relative" style={{ width: `${leftPanelWidth}%` }}>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 tiny-scrollbar" style={{ paddingBottom: '80px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg text-sm ${
              message.type === 'user' 
                ? 'bg-gray-200 text-gray-600 max-w-xs' 
                : 'text-gray-900 w-full'
            }`}>
              {message.type === 'user' ? (
                <div className="font-mono whitespace-pre-line">
                  {message.content}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {waitingForNext && (
          <div className="flex justify-center gap-2">
            <button
              onClick={handleNextProblem}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Practice More'}
            </button>
            <button
              onClick={handleBackToGallery}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded text-sm"
            >
              Back to Gallery
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input area */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-50">
        <div className="relative flex">
          {chatMode === 'solve' && viewMode === 'single' && (
            <div 
              className="line-numbers flex-shrink-0"
              style={{ 
                height: Math.max(36, Math.min(window.innerHeight * 0.6667, currentInput.split('\n').length * 20 + 16)) + 'px'
              }}
            >
              {Array.from({ length: Math.max(1, currentInput.split('\n').length) }, (_, i) => i + 1).join('\n')}
            </div>
          )}
          
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitAnswer();
              }
            }}
            placeholder={chatMode === 'ask' || viewMode === 'gallery' ? "Ask me about SQL..." : "Type your SQL query..."}
            className={`flex-1 px-3 py-2 border border-gray-300 text-sm font-mono tiny-scrollbar bg-white custom-textarea ${
              chatMode === 'solve' && viewMode === 'single' ? 'code-textarea' : 'rounded'
            }`}
            style={{ 
              minHeight: '36px',
              maxHeight: '66.67vh',
              height: Math.max(36, Math.min(window.innerHeight * 0.6667, currentInput.split('\n').length * 20 + 16)) + 'px',
              paddingRight: '12px',
              resize: 'none'
            }}
          />
          
          {viewMode === 'single' && (phase === 'learning' || phase === 'practicing') && (
            <div 
              className="absolute right-3 flex gap-1"
              style={{
                top: '2px'
              }}
            >
              <button
                onClick={() => setChatMode('solve')}
                className={`p-2 rounded transition-colors ${
                  chatMode === 'solve' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title="Solve Problems"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => setChatMode('ask')}
                className={`p-2 rounded transition-colors ${
                  chatMode === 'ask' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title="Ask Tutor"
              >
                <BookOpen size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
