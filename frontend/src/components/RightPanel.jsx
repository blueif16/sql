import React from 'react';
import { ChevronRight, ChevronDown, Grid3X3 } from 'lucide-react';
import DataTable from './DataTable';
import GalleryView from './GalleryView';
import PracticeTab from './PracticeTab';
import LearnTab from './LearnTab';

const RightPanel = ({
  viewMode,
  rightPanelTab,
  setRightPanelTab,
  concepts,
  expandedDifficulties,
  toggleDifficulty,
  startConcept,
  startPractice,
  selectedConcept,
  currentProblem,
  phase,
  toggleViewMode,
  handleBackToGallery,
  currentInput,
  chatMode,
  lastResult,
  leftPanelWidth,
  isLoading
}) => {
  // 日志：接收到的currentProblem数据
  React.useEffect(() => {
    if (currentProblem) {
      console.log('[RightPanel] 当前问题:', currentProblem);
      console.log('[RightPanel] SQL Schema:', currentProblem.sql_schema);
      console.log('[RightPanel] SQL Schema类型:', typeof currentProblem.sql_schema);
    }
  }, [currentProblem]);

  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ width: `${100 - leftPanelWidth}%` }}>
      {/* Tab Navigation */}
      {viewMode === 'single' && (
        <div className="bg-white border-b border-gray-300">
          <div className="flex">
            <button
              onClick={() => setRightPanelTab('learn')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                rightPanelTab === 'learn'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => {
                setRightPanelTab('practice');
                if (!currentProblem && phase !== 'practicing') {
                  startPractice();
                }
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                rightPanelTab === 'practice'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              Practice
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 tiny-scrollbar">
        {viewMode === 'gallery' ? (
          <GalleryView
            concepts={concepts}
            expandedDifficulties={expandedDifficulties}
            toggleDifficulty={toggleDifficulty}
            startConcept={startConcept}
            isLoading={isLoading}
          />
        ) : rightPanelTab === 'learn' ? (
          <LearnTab
            selectedConcept={selectedConcept}
          />
        ) : (
          <PracticeTab
            currentProblem={currentProblem}
            selectedConcept={selectedConcept}
            phase={phase}
            handleBackToGallery={handleBackToGallery}
            currentInput={currentInput}
            chatMode={chatMode}
            lastResult={lastResult}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default RightPanel;
