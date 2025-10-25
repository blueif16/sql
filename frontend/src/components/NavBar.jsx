import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, LogIn, ChevronDown, BookOpen, Loader2, Save, Award, TrendingUp, Zap, Languages, Check } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../config/constants';
import { problemAPI, preferenceAPI, conceptAPI, userAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const NavBar = ({ user, onNavigate, onLogout }) => { // NavBar component: user info, navigation, logout callbacks
  const { language, toggleLanguage, t } = useLanguage(); // Language management hook
  const texts = t('navbar'); // Get navbar translations
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown menu toggle state
  const [isTopicOverlayOpen, setIsTopicOverlayOpen] = useState(false); // Topic overlay toggle state
  const [isGenerating, setIsGenerating] = useState(false); // Problem generation loading state
  const [isSaving, setIsSaving] = useState(false); // Saving preferences loading state
  const [isLoadingConcepts, setIsLoadingConcepts] = useState(false); // Loading concepts state
  const [selectedTopics, setSelectedTopics] = useState([]); // Selected interest topics state
  const [conceptsByDifficulty, setConceptsByDifficulty] = useState({ beginner: [], intermediate: [], advanced: [] }); // Concepts grouped by difficulty
  const dropdownRef = useRef(null); // Dropdown menu DOM reference


  useEffect(() => { // Load user preferences when user logs in
    if (user) {
      loadUserPreferences();
    } else {
      setSelectedTopics([]);
    }
  }, [user]);

  useEffect(() => { // Close dropdown and overlay when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Close topic overlay when clicking outside
      if (!event.target.closest('.topic-overlay') && !event.target.closest('.choose-topic-btn')) {
        setIsTopicOverlayOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => { // Handle profile navigation
    setIsDropdownOpen(false);
    onNavigate && onNavigate(ROUTES.PROFILE);
  };

  const handleLoginClick = () => { // Handle login navigation
    setIsDropdownOpen(false);
    onNavigate && onNavigate(ROUTES.LOGIN);
  };

  const handleLogoutClick = () => { // Handle logout action
    setIsDropdownOpen(false);
    onLogout && onLogout();
  };


  const loadUserPreferences = async () => { // Load user's saved interest preferences
    try {
      const response = await preferenceAPI.getPreferences();
      if (response.interest_areas && Array.isArray(response.interest_areas)) {
        setSelectedTopics(response.interest_areas);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadConceptsWithProgress = async () => { // Load all concepts with user progress
    setIsLoadingConcepts(true);
    try {
      const response = await conceptAPI.getConceptsWithProgress();
      setConceptsByDifficulty(response);
    } catch (error) {
      console.error('Failed to load concepts:', error);
      alert(texts.loadFailed + (error.response?.data?.error || error.message || texts.unknownError));
    } finally {
      setIsLoadingConcepts(false);
    }
  };

  const handleTopicToggle = (conceptName) => { // Toggle topic selection (multi-select)
    setSelectedTopics(prev => {
      if (prev.includes(conceptName)) {
        return prev.filter(t => t !== conceptName);
      } else {
        return [...prev, conceptName];
      }
    });
  };

  const handleOpenTopicOverlay = () => { // Open overlay and load concepts
    setIsTopicOverlayOpen(true);
    setIsDropdownOpen(false);
    loadConceptsWithProgress();
  };

  const handleSaveInterests = async () => { // Save selected interests to database
    if (!user) {
      alert(texts.loginFirst);
      return;
    }

    setIsSaving(true);
    try {
      await preferenceAPI.updatePreferences({ interest_areas: selectedTopics });
      alert(texts.saveSuccess);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert(texts.saveFailed + (error.response?.data?.error || error.message || texts.unknownError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateProblem = async () => { // Generate problem based on selected interests
    if (!user) {
      alert(texts.loginFirst);
      return;
    }

    if (selectedTopics.length === 0) {
      alert(texts.selectAtLeastOne);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const randomTopic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
      
      // Find the concept details from loaded data
      let topicInfo = '';
      for (const difficulty of ['beginner', 'intermediate', 'advanced']) {
        const concept = conceptsByDifficulty[difficulty].find(c => c.name === randomTopic);
        if (concept) {
          topicInfo = concept.description;
          break;
        }
      }
      
      const response = await problemAPI.generateProblem({
        topic: randomTopic,
        topic_info: topicInfo
      });
      
      if (response.success) {
        alert(texts.generateSuccess);
        setIsTopicOverlayOpen(false);
        if (onNavigate && response.problem?.id) {
          onNavigate(`/problem/${response.problem.id}`);
        }
      } else {
        alert(texts.generateFailed);
      }
    } catch (error) {
      console.error('Error generating problem:', error);
      alert(texts.generateFailed + ': ' + (error.response?.data?.error || error.message || texts.unknownError));
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyIcon = (difficulty) => { // Get icon for difficulty level
    switch (difficulty) {
      case 'beginner': return <Zap className="w-5 h-5" />;
      case 'intermediate': return <TrendingUp className="w-5 h-5" />;
      case 'advanced': return <Award className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty) => { // Get color scheme for difficulty level
    switch (difficulty) {
      case 'beginner': return { bg: 'bg-green-500/80', border: 'border-green-300/60', selectedBg: 'bg-green-500/40', text: 'text-green-100' };
      case 'intermediate': return { bg: 'bg-yellow-500/80', border: 'border-yellow-300/60', selectedBg: 'bg-yellow-500/40', text: 'text-yellow-100' };
      case 'advanced': return { bg: 'bg-red-500/80', border: 'border-red-300/60', selectedBg: 'bg-red-500/40', text: 'text-red-100' };
      default: return { bg: 'bg-gray-500/80', border: 'border-gray-300/60', selectedBg: 'bg-gray-500/40', text: 'text-gray-100' };
    }
  };

  const getUserInitials = () => { // Get user initials for avatar
    if (!user?.username) return 'G';
    const names = user.username.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = () => { // Generate consistent color based on username
    if (!user?.username) return 'from-gray-400 to-gray-500';
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-rose-500 to-pink-600',
    ];
    const hash = user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* SQL Tutor Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {texts.appName}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none transition-all duration-200 px-3 py-2 rounded-xl hover:bg-gray-100/80 group"
            >
              {/* Avatar with Initials */}
              <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200`}>
                <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
              </div>
              {user && (
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {user.username}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {user ? (
                  <>
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor()} rounded-full flex items-center justify-center shadow-md`}>
                          <span className="text-white font-bold text-base">{getUserInitials()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email || texts.viewProfile}</p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Button */}
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{texts.profile}</span>
                    </button>

                    {/* Choose Topic Button */}
                    <button
                      onClick={handleOpenTopicOverlay}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group choose-topic-btn"
                    >
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium">{texts.chooseTopic}</span>
                    </button>

                    {/* Language Switch Button */}
                    <button
                      onClick={async () => {
                        const newLang = language === 'zh' ? 'en' : 'zh';
                        toggleLanguage();
                        if (user) {
                          try {
                            await userAPI.updateLanguage(newLang);
                            // 触发语言变更事件通知其他组件
                            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
                            // 刷新页面数据以获取新语言的内容
                            window.location.reload();
                          } catch (error) {
                            console.error('Failed to update language on server:', error);
                          }
                        }
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <Languages className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
                    </button>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium">{texts.logout}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLoginClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <LogIn className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">{texts.login}</span>
                    </button>

                    {/* Language Switch Button for non-logged-in users */}
                    <button
                      onClick={async () => {
                        const newLang = language === 'zh' ? 'en' : 'zh';
                        toggleLanguage();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                        <Languages className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="font-medium">{language === 'zh' ? 'English' : '中文'}</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Selection Overlay */}
      {isTopicOverlayOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] animate-in fade-in duration-200">
          <div className="topic-overlay flex items-center justify-center min-h-screen p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">{texts.chooseTopicTitle}</h2>
                <p className="text-white/80">
                  {isGenerating ? texts.generating : 
                   isSaving ? texts.saving : 
                   isLoadingConcepts ? texts.loading :
                   texts.selectTopics(selectedTopics.length)}
                </p>
              </div>

              {isGenerating || isSaving || isLoadingConcepts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
                  <p className="text-white/90 text-lg">
                    {isGenerating ? texts.generatingMsg : isSaving ? texts.savingMsg : texts.loadingMsg}
                  </p>
                  <p className="text-white/70 text-sm mt-2">{texts.waitMsg}</p>
                </div>
              ) : (
                <>
                  {/* Three columns for different difficulty levels */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Beginner Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-500/80 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-100">{texts.beginner}</h3>
                          <p className="text-green-200/80 text-sm">{texts.beginnerDesc}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {conceptsByDifficulty.beginner.map((concept) => {
                          const isSelected = selectedTopics.includes(concept.name);
                          const colors = getDifficultyColor('beginner');
                          return (
                            <button
                              key={concept.id}
                              onClick={() => handleTopicToggle(concept.name)}
                              className={`w-full p-4 backdrop-blur-sm border rounded-xl transition-all duration-200 hover:scale-102 text-left ${
                                isSelected 
                                  ? `${colors.selectedBg} ${colors.border} shadow-md` 
                                  : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-white text-base">{concept.localized_name || concept.name}</h4>
                                {isSelected && <Check className="w-5 h-5 text-white flex-shrink-0" />}
                              </div>
                              <p className="text-white/70 text-xs line-clamp-2 mb-2">{concept.localized_description || concept.description}</p>
                              {user && concept.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-white/20 rounded-full h-2">
                                    <div 
                                      className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${concept.progress_percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white/80 text-xs font-medium whitespace-nowrap">
                                    {concept.solved}/{concept.total}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Intermediate Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-500/80 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-yellow-100">{texts.intermediate}</h3>
                          <p className="text-yellow-200/80 text-sm">{texts.intermediateDesc}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {conceptsByDifficulty.intermediate.map((concept) => {
                          const isSelected = selectedTopics.includes(concept.name);
                          const colors = getDifficultyColor('intermediate');
                          return (
                            <button
                              key={concept.id}
                              onClick={() => handleTopicToggle(concept.name)}
                              className={`w-full p-4 backdrop-blur-sm border rounded-xl transition-all duration-200 hover:scale-102 text-left ${
                                isSelected 
                                  ? `${colors.selectedBg} ${colors.border} shadow-md` 
                                  : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-white text-base">{concept.localized_name || concept.name}</h4>
                                {isSelected && <Check className="w-5 h-5 text-white flex-shrink-0" />}
                              </div>
                              <p className="text-white/70 text-xs line-clamp-2 mb-2">{concept.localized_description || concept.description}</p>
                              {user && concept.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-white/20 rounded-full h-2">
                                    <div 
                                      className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${concept.progress_percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white/80 text-xs font-medium whitespace-nowrap">
                                    {concept.solved}/{concept.total}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Advanced Column */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-500/80 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-red-100">{texts.advanced}</h3>
                          <p className="text-red-200/80 text-sm">{texts.advancedDesc}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {conceptsByDifficulty.advanced.map((concept) => {
                          const isSelected = selectedTopics.includes(concept.name);
                          const colors = getDifficultyColor('advanced');
                          return (
                            <button
                              key={concept.id}
                              onClick={() => handleTopicToggle(concept.name)}
                              className={`w-full p-4 backdrop-blur-sm border rounded-xl transition-all duration-200 hover:scale-102 text-left ${
                                isSelected 
                                  ? `${colors.selectedBg} ${colors.border} shadow-md` 
                                  : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-white text-base">{concept.localized_name || concept.name}</h4>
                                {isSelected && <Check className="w-5 h-5 text-white flex-shrink-0" />}
                              </div>
                              <p className="text-white/70 text-xs line-clamp-2 mb-2">{concept.localized_description || concept.description}</p>
                              {user && concept.total > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-white/20 rounded-full h-2">
                                    <div 
                                      className={`${colors.bg} h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${concept.progress_percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-white/80 text-xs font-medium whitespace-nowrap">
                                    {concept.solved}/{concept.total}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4 pt-6 border-t border-white/20">
                    <button
                      onClick={handleSaveInterests}
                      disabled={!user}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500/80 hover:bg-green-500/90 backdrop-blur-sm border border-green-300/50 text-white rounded-xl transition-all duration-200 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                    >
                      <Save className="w-5 h-5" />
                      {texts.savePreferences}
                    </button>
                    <button
                      onClick={handleGenerateProblem}
                      disabled={!user || selectedTopics.length === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-500/80 hover:bg-purple-500/90 backdrop-blur-sm border border-purple-300/50 text-white rounded-xl transition-all duration-200 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                    >
                      <BookOpen className="w-5 h-5" />
                      {texts.generateProblem}
                    </button>
                    <button
                      onClick={() => setIsTopicOverlayOpen(false)}
                      disabled={isGenerating || isSaving}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-xl transition-all duration-200 font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {texts.close}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default NavBar;

