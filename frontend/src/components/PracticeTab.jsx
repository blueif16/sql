import React from 'react';
import { Grid3X3, CheckCircle, X } from 'lucide-react';
import DataTable from './DataTable';
import { executeValidQuery } from '../utils/queryExecutor';

const PracticeTab = ({
  sections,
  currentSectionIndex,
  currentConceptIndex,
  currentProblemIndex,
  showProblemNotification,
  phase,
  toggleViewMode,
  currentInput,
  chatMode,
  lastResult
}) => {
  return (
    <>
      {showProblemNotification && phase === 'problems' && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {sections[currentSectionIndex].concepts[currentConceptIndex].name}
            </div>
            <button
              onClick={toggleViewMode}
              className="bg-gray-50 border border-gray-300 p-1.5 rounded hover:bg-gray-100 transition-colors"
              title="View All Sections"
            >
              <Grid3X3 size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {showProblemNotification && phase === 'problems' && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-700 mb-4">
            {sections[currentSectionIndex].concepts[currentConceptIndex].problems[currentProblemIndex]?.task}
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <div className="font-medium mb-2 text-xs">
              {sections[currentSectionIndex].concepts[currentConceptIndex].problems[currentProblemIndex]?.tableName}
            </div>
            <DataTable data={sections[currentSectionIndex].concepts[currentConceptIndex].problems[currentProblemIndex]?.tableData} />
          </div>
        </div>
      )}

      {/* Live Query Preview */}
      {currentInput && chatMode === 'solve' && (
        <div className="space-y-3">
          <div className="font-medium text-sm text-gray-800">Live Query Preview</div>
          {(() => {
            const currentProblem = sections[currentSectionIndex]?.concepts[currentConceptIndex]?.problems[currentProblemIndex];
            const result = executeValidQuery(currentInput, currentProblem?.tableData || [], currentProblem?.tableName || '');
            
            if (result && result.isValid) {
              return <DataTable data={result.data} />;
            } else {
              return (
                <div className="text-xs text-gray-500 py-2">Query incomplete or invalid - complete your SQL statement to see results</div>
              );
            }
          })()}
        </div>
      )}

      {lastResult && chatMode === 'solve' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            {lastResult.isCorrect ? (
              <CheckCircle size={16} className="text-gray-600" />
            ) : (
              <X size={16} className="text-gray-600" />
            )}
            <span className="font-medium text-sm">Query Result</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <DataTable data={lastResult.userOutput} title="Your Output:" />
            </div>
            
            {!lastResult.isCorrect && (
              <div>
                <DataTable data={lastResult.expectedOutput} title="Expected Output:" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PracticeTab;
