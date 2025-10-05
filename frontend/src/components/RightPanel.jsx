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
  currentTheme,
  setCurrentTheme,
  sections,
  expandedSections,
  toggleSection,
  jumpToConcept,
  currentSectionIndex,
  currentConceptIndex,
  currentProblemIndex,
  showProblemNotification,
  phase,
  toggleViewMode,
  currentInput,
  chatMode,
  lastResult,
  leftPanelWidth
}) => {
  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ width: `${100 - leftPanelWidth}%` }}>
      {/* Tab Navigation with Theme Selector */}
      {viewMode === 'single' && (
        <div className="bg-white border-b border-gray-300">
          <div className="flex">
            <button
              onClick={() => setRightPanelTab('practice')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                rightPanelTab === 'practice'
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
              }`}
            >
              Practice
            </button>
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
            <div className="ml-auto flex items-center gap-2 px-4">
              <span className="text-xs text-gray-600">Theme:</span>
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="default">Default</option>
                <option value="harryPotter">Harry Potter</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 tiny-scrollbar">
        {viewMode === 'gallery' ? (
          <GalleryView
            sections={sections}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            jumpToConcept={jumpToConcept}
          />
        ) : rightPanelTab === 'practice' ? (
          <PracticeTab
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            currentConceptIndex={currentConceptIndex}
            currentProblemIndex={currentProblemIndex}
            showProblemNotification={showProblemNotification}
            phase={phase}
            toggleViewMode={toggleViewMode}
            currentInput={currentInput}
            chatMode={chatMode}
            lastResult={lastResult}
          />
        ) : (
          <LearnTab
            sections={sections}
            currentSectionIndex={currentSectionIndex}
            currentConceptIndex={currentConceptIndex}
          />
        )}
      </div>
    </div>
  );
};

export default RightPanel;
