import React from 'react';
import PracticeTab from './PracticeTab';
import LearnTab from './LearnTab';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../config/constants';
import { useLanguage } from '../hooks/useLanguage';

const ProblemRightPanel = ({ // Right panel for problem page
  problem,
  conceptInfo,
  rightPanelTab,
  setRightPanelTab,
  currentInput,
  chatMode,
  lastResult,
  leftPanelWidth
}) => {
  const { t } = useLanguage();
  if (!problem) return null;

  return (
    <div className="bg-gray-100 flex flex-col overflow-hidden" style={{ width: `${100 - leftPanelWidth}%` }}>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-300">
        <div className="flex items-center">
          <button
            onClick={() => setRightPanelTab('practice')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              rightPanelTab === 'practice'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            {t('problemPanel').tabPractice}
          </button>
          <button
            onClick={() => setRightPanelTab('learn')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              rightPanelTab === 'learn'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 bg-gray-50'
            }`}
          >
            {t('problemPanel').tabLearn}
          </button>
          <div className="ml-auto flex items-center gap-2 px-4">
            {problem.difficulty && (
              <span className={`text-xs px-2 py-1 rounded ${DIFFICULTY_COLORS[problem.difficulty] || 'text-gray-600 bg-gray-100'}`}>
                {DIFFICULTY_LABELS[problem.difficulty] || problem.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 tiny-scrollbar">
        {rightPanelTab === 'practice' ? (
          <PracticeTab
            currentProblem={problem}
            selectedConcept={{ name: problem.primary_concept }}
            phase="problems"
            handleBackToGallery={() => window.history.back()}
            chatMode={chatMode}
            lastResult={lastResult}
            isLoading={false}
          />
        ) : (
          <LearnTab
            selectedConcept={{
              name: problem.primary_concept,
              localized_name: conceptInfo?.localized_name,
              description: conceptInfo?.description || problem.description,
              localized_description: conceptInfo?.localized_description,
              difficulty_level: problem.difficulty,
              prerequisites: conceptInfo?.prerequisites || [],
              syntax: conceptInfo?.syntax,
              examples: conceptInfo?.examples
            }}
            conceptInfo={conceptInfo}
          />
        )}
      </div>
    </div>
  );
};

export default ProblemRightPanel;

