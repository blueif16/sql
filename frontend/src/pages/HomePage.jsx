import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, TrendingUp, Award, Check, Loader2, Save, Sparkles } from 'lucide-react';
import { conceptAPI, interestAPI, preferenceAPI, problemAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [concepts, setConcepts] = useState({ beginner: [], intermediate: [], advanced: [] }); // SQL概念按难度分组
  const [interests, setInterests] = useState([]); // 所有兴趣领域
  const [selectedInterests, setSelectedInterests] = useState([]); // 用户选择的兴趣
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false);
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('concepts'); // 'concepts' or 'interests'

  useEffect(() => { // 加载概念和用户偏好
    loadConcepts();
    loadInterests();
    loadUserPreferences();
  }, []);

  const loadConcepts = async () => { // 从后端加载SQL概念
    try {
      setIsLoadingConcepts(true);
      const data = await conceptAPI.getConceptsWithProgress();
      setConcepts(data);
    } catch (error) {
      console.error('Failed to load concepts:', error);
    } finally {
      setIsLoadingConcepts(false);
    }
  };

  const loadInterests = async () => { // 从后端加载兴趣领域
    try {
      setIsLoadingInterests(true);
      const response = await interestAPI.getInterests();
      setInterests(response.results || response);
    } catch (error) {
      console.error('Failed to load interests:', error);
    } finally {
      setIsLoadingInterests(false);
    }
  };

  const loadUserPreferences = async () => { // 加载用户已保存的兴趣偏好
    try {
      const response = await preferenceAPI.getPreferences();
      if (response.interest_areas && Array.isArray(response.interest_areas)) {
        setSelectedInterests(response.interest_areas);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleInterestToggle = (interestName) => { // 切换兴趣选择
    setSelectedInterests(prev => 
      prev.includes(interestName) 
        ? prev.filter(i => i !== interestName) 
        : [...prev, interestName]
    );
  };

  const handleSaveInterests = async () => { // 保存兴趣偏好到后端
    try {
      setIsSaving(true);
      await preferenceAPI.updatePreferences({ interest_areas: selectedInterests });
      alert(t('homePage').savedSuccess);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert(t('homePage').saveFailed + (error.response?.data?.error || error.message || t('homePage').unknownError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConceptClick = async (concept) => { // 点击概念生成题目
    if (selectedInterests.length === 0) {
      const confirmGenerate = window.confirm(t('homePage').confirmNoInterest);
      if (!confirmGenerate) {
        setActiveTab('interests');
        return;
      }
    }

    try {
      setIsGenerating(true);
      const response = await problemAPI.generateProblem({ topic: concept.name });
      
      if (response.success && response.problem?.id) {
        navigate(`/problem?id=${response.problem.id}`); // 跳转到题目页面
      } else {
        alert(t('navbar').generateFailed);
      }
    } catch (error) {
      console.error('Failed to generate problem:', error);
      alert(t('homePage').generateFailed + (error.response?.data?.error || error.message || t('homePage').unknownError));
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyIcon = (difficulty) => { // 难度图标
    switch (difficulty) {
      case 'beginner': return <Zap className="w-5 h-5" />;
      case 'intermediate': return <TrendingUp className="w-5 h-5" />;
      case 'advanced': return <Award className="w-5 h-5" />;
      default: return null;
    }
  };

  const getDifficultyLabel = (difficulty) => { // 难度标签
    const texts = t('homePage');
    switch (difficulty) {
      case 'beginner': return texts.difficultyBeginner;
      case 'intermediate': return texts.difficultyIntermediate;
      case 'advanced': return texts.difficultyAdvanced;
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty) => { // 难度颜色
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const groupedInterests = interests.reduce((acc, interest) => { // 按类别分组兴趣
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {});

  const getCategoryLabel = (category) => { // 类别标签
    const texts = t('homePage');
    const mapping = {
      entertainment: texts.categoryEntertainment,
      sports: texts.categorySports,
      business: texts.categoryBusiness,
      technology: texts.categoryTechnology,
      education: texts.categoryEducation,
      travel: texts.categoryTravel,
      health: texts.categoryHealth,
    };
    return mapping[category] || category;
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('homePage').title}</h1>
          <p className="text-gray-600">{t('homePage').subtitle}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'concepts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('homePage').tabConcepts}
          </button>
          <button
            onClick={() => setActiveTab('interests')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'interests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('homePage').tabInterests} {selectedInterests.length > 0 && `(${selectedInterests.length})`}
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'concepts' ? (
          <div className="space-y-8">
            {/* Loading State */}
            {isLoadingConcepts && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {/* Concepts by Difficulty */}
            {!isLoadingConcepts && ['beginner', 'intermediate', 'advanced'].map((difficulty) => (
              <div key={difficulty} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${getDifficultyColor(difficulty)}`}>
                    {getDifficultyIcon(difficulty)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{getDifficultyLabel(difficulty)}</h2>
                    <p className="text-sm text-gray-600">{t('homePage').conceptsCount(concepts[difficulty]?.length || 0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {concepts[difficulty]?.map((concept) => (
                    <button
                      key={concept.id}
                      onClick={() => handleConceptClick(concept)}
                      disabled={isGenerating}
                      className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{concept.localized_name || concept.name}</h3>
                        {concept.total > 0 && (
                          <span className="text-xs text-gray-500">
                            {concept.solved}/{concept.total}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{concept.localized_description || concept.description}</p>
                      {concept.total > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all" 
                            style={{ width: `${concept.progress_percentage}%` }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {(!concepts[difficulty] || concepts[difficulty].length === 0) && (
                  <p className="text-center text-gray-500 py-4">{t('homePage').noConcepts}</p>
                )}
              </div>
            ))}

            {/* Generating Overlay */}
            {isGenerating && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-sm">
                  <div className="flex flex-col items-center">
                    <Sparkles className="w-12 h-12 text-blue-600 animate-pulse mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('homePage').generating}</h3>
                    <p className="text-sm text-gray-600 text-center">{t('homePage').generatingSubtitle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interest Selection Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">{t('homePage').interestExplainTitle}</h3>
              <p className="text-sm text-blue-800">
                {t('homePage').interestExplainText}
              </p>
            </div>

            {/* Loading State */}
            {isLoadingInterests && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            )}

            {/* Interests by Category */}
            {!isLoadingInterests && Object.entries(groupedInterests).map(([category, categoryInterests]) => (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{getCategoryLabel(category)}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.name);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.name)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{interest.icon}</span>
                          {isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                        </div>
                        <div className="font-medium text-sm text-gray-900">{interest.localized_display_name || interest.display_name}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{interest.localized_description || interest.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSaveInterests}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('homePage').saving}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('homePage').saveInterests}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
