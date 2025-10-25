import React from 'react';
import { Grid3X3, CheckCircle, X, Loader2 } from 'lucide-react';

const PracticeTab = ({
  currentProblem,
  selectedConcept,
  phase,
  handleBackToGallery,
  chatMode,
  lastResult,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-gray-700 mb-4">
            {selectedConcept ? `暂无 ${selectedConcept.name} 的练习题` : '请先选择一个概念'}
          </div>
          <button
            onClick={handleBackToGallery}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            返回概念画廊
          </button>
        </div>
      </div>
    );
  }

  // 日志：SQL Schema内容
  console.log('[PracticeTab] currentProblem:', currentProblem);
  console.log('[PracticeTab] sql_schema:', currentProblem.sql_schema);
  console.log('[PracticeTab] sql_schema类型:', typeof currentProblem.sql_schema);

  // 简单的Markdown渲染函数
  const renderMarkdown = (markdown) => {
    if (!markdown) return null;
    
    const lines = markdown.split('\n');
    const elements = [];
    let currentSection = [];
    let inCodeBlock = false;
    let codeContent = [];
    
    lines.forEach((line, idx) => {
      // 代码块处理
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="bg-gray-50 border border-gray-200 rounded p-3 mb-3 overflow-x-auto">
              <code className="text-xs font-mono text-gray-700">{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }
      
      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }
      
      // 标题处理
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${idx}`} className="font-medium text-sm text-gray-800 mb-2 mt-3">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }
      
      // 粗体文本
      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <div key={`bold-${idx}`} className="font-medium text-xs text-gray-700 mb-2">
            {line.replace(/\*\*/g, '')}
          </div>
        );
        return;
      }
      
      // 表格处理
      if (line.includes('|')) {
        if (!currentSection.length || currentSection[0].includes('|')) {
          currentSection.push(line);
        } else {
          if (currentSection.length > 0) {
            elements.push(renderTable(currentSection, idx));
            currentSection = [];
          }
          currentSection.push(line);
        }
        return;
      }
      
      // 普通文本
      if (line.trim()) {
        if (currentSection.length > 0 && currentSection[0].includes('|')) {
          elements.push(renderTable(currentSection, idx));
          currentSection = [];
        }
        elements.push(
          <p key={`p-${idx}`} className="text-xs text-gray-700 mb-2">{line}</p>
        );
      }
    });
    
    // 处理剩余的表格
    if (currentSection.length > 0 && currentSection[0].includes('|')) {
      elements.push(renderTable(currentSection, elements.length));
    }
    
    return elements;
  };
  
  // 渲染Markdown表格
  const renderTable = (tableLines, key) => {
    if (tableLines.length < 2) return null;
    
    const headers = tableLines[0].split('|').filter(h => h.trim()).map(h => h.trim());
    const rows = tableLines.slice(2).map(line => 
      line.split('|').filter(c => c.trim()).map(c => c.trim())
    );
    
    return (
      <div key={`table-${key}`} className="overflow-auto rounded border border-gray-300 mb-3">
        <table className="min-w-full text-xs border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="border-b border-r border-gray-300 px-3 py-2 text-left font-medium text-gray-700 last:border-r-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="border-b border-r border-gray-300 px-3 py-2 text-gray-800 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {/* Problem Header */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
              {currentProblem.difficulty}
            </span>
            <span className="text-xs text-gray-600">{selectedConcept?.localized_name || selectedConcept?.name}</span>
          </div>
          <button
            onClick={handleBackToGallery}
            className="bg-gray-50 border border-gray-300 p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="返回概念画廊"
          >
            <Grid3X3 size={14} className="text-gray-600" />
          </button>
        </div>
        
        <h3 className="font-medium text-sm text-gray-900 mb-2">{currentProblem.title}</h3>
        <p className="text-sm text-gray-700">{currentProblem.description}</p>
      </div>

      {/* SQL Schema Display - Markdown Format */}
      {currentProblem.sql_schema && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
          {renderMarkdown(currentProblem.sql_schema)}
        </div>
      )}

      {/* Query Result */}
      {lastResult && chatMode === 'solve' && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            {lastResult.isCorrect ? (
              <>
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-medium text-sm text-green-700">正确!</span>
              </>
            ) : (
              <>
                <X size={16} className="text-red-600" />
                <span className="font-medium text-sm text-red-700">不正确</span>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-1">你的查询:</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2">
              <code className="text-xs font-mono">{lastResult.userQuery}</code>
            </div>
          </div>
          
          {lastResult.message && (
            <div className="text-xs text-gray-600 border-t pt-2">
              {lastResult.message}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PracticeTab;
