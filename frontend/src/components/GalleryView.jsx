import React from 'react';
import { ChevronRight, ChevronDown, Zap, TrendingUp, Award } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const GalleryView = ({ concepts, expandedDifficulties, toggleDifficulty, startConcept, isLoading }) => {
  const { t } = useLanguage();
  const getDifficultyIcon = (difficulty) => { // 难度级别图标
    switch (difficulty) {
      case 'beginner': return <Zap className="w-5 h-5 text-green-500" />;
      case 'intermediate': return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'advanced': return <Award className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getDifficultyLabel = (difficulty) => { // 难度级别标签
    const texts = t('galleryView');
    switch (difficulty) {
      case 'beginner': return texts.difficultyBeginner;
      case 'intermediate': return texts.difficultyIntermediate;
      case 'advanced': return texts.difficultyAdvanced;
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty) => { // 难度级别颜色
    switch (difficulty) {
      case 'beginner': return 'border-green-200 bg-green-50';
      case 'intermediate': return 'border-yellow-200 bg-yellow-50';
      case 'advanced': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t('galleryView').loading}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-medium text-gray-800">{t('galleryView').title}</div>
      <p className="text-sm text-gray-600">{t('galleryView').subtitle}</p>
      
      {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
        <div key={difficulty} className={`bg-white border rounded-lg shadow-sm ${getDifficultyColor(difficulty)}`}>
          <button
            onClick={() => toggleDifficulty(difficulty)}
            className="w-full p-4 text-left hover:bg-white/50 transition-colors rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {getDifficultyIcon(difficulty)}
              <div>
                <h3 className="font-medium text-sm">{getDifficultyLabel(difficulty)}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {t('galleryView').conceptsCount(concepts[difficulty]?.length || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {expandedDifficulties.includes(difficulty) ? 
                <ChevronDown size={16} className="text-gray-400" /> : 
                <ChevronRight size={16} className="text-gray-400" />
              }
            </div>
          </button>
          
          {expandedDifficulties.includes(difficulty) && (
            <div className="border-t border-gray-200 p-4 space-y-3">
              {concepts[difficulty]?.length > 0 ? (
                concepts[difficulty].map((concept) => (
                  <div
                    key={concept.id}
                    onClick={() => startConcept(concept)}
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm text-gray-800">{concept.localized_name || concept.name}</h4>
                      {concept.total > 0 && (
                        <span className="text-xs text-gray-500">
                          {t('galleryView').completedCount(concept.solved, concept.total)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed mb-2">
                      {concept.localized_description || concept.description}
                    </p>
                    {concept.total > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${concept.progress_percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 text-center py-4">
                  {t('galleryView').noConcepts}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GalleryView;
