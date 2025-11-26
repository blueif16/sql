import React from 'react';
import { Grid3X3, CheckCircle, X, Loader2 } from 'lucide-react';
import SQLTable from '../../components/SQLTable';

const PracticeTab = ({
  currentProblem,
  selectedConcept,
  phase,
  handleBackToGallery,
  chatMode,
  lastResult,
  isLoading,
  sqlExecutionResults
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-gray-700 mb-4">
            {selectedConcept ? `No ${selectedConcept.name} practice problems available` : 'Please select a concept first'}
          </div>
          <button
            onClick={handleBackToGallery}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            Back to Concept Gallery
          </button>
        </div>
      </div>
    );
  }

  // 日志：SQL Schema内容
  console.log('[PracticeTab] currentProblem:', currentProblem);
  console.log('[PracticeTab] sql_schema:', currentProblem.sql_schema);
  console.log('[PracticeTab] sql_schema类型:', typeof currentProblem.sql_schema);

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
            title="Back to Concept Gallery"
          >
            <Grid3X3 size={14} className="text-gray-600" />
          </button>
        </div>
        
        <h3 className="font-medium text-sm text-gray-900 mb-2">{currentProblem.title}</h3>
        <p className="text-sm text-gray-700">{currentProblem.description}</p>
      </div>

      {/* SQL Schema Display - Interactive Table */}
      {currentProblem.sql_schema && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <SQLTable sqlCode={currentProblem.sql_schema} autoExecute={true} />
        </div>
      )}

      {/* SQL Execution Results - Display as Table */}
      {sqlExecutionResults && sqlExecutionResults.columns && sqlExecutionResults.columns.length > 0 && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Query Results</h4>
            <div className="text-xs text-gray-600 mt-1">
              Executed SQL: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{sqlExecutionResults.sqlQuery}</code>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {sqlExecutionResults.columns.map((col, index) => (
                    <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sqlExecutionResults.data.slice(0, 20).map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {sqlExecutionResults.columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-3 py-2 text-sm text-gray-900 break-words">
                        {row[col] === null || row[col] === undefined ? 'NULL' : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
                {sqlExecutionResults.data.length > 20 && (
                  <tr>
                    <td colSpan={sqlExecutionResults.columns.length} className="px-3 py-2 text-sm text-gray-500 text-center italic">
                      ... and {sqlExecutionResults.data.length - 20} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {sqlExecutionResults.data.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Query executed successfully, but returned no data
            </div>
          )}
        </div>
      )}

      {/* Query Result */}
      {lastResult && chatMode === 'solve' && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-2">
            {lastResult.isCorrect ? (
              <>
                <CheckCircle size={16} className="text-green-600" />
                <span className="font-medium text-sm text-green-700">Correct!</span>
              </>
            ) : (
              <>
                <X size={16} className="text-red-600" />
                <span className="font-medium text-sm text-red-700">Incorrect</span>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-1">Your Query:</div>
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
