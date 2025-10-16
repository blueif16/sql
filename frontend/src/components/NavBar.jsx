import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, LogIn, ChevronDown, Palette, Check, BookOpen } from 'lucide-react';
import { APP_CONFIG, ROUTES, THEME_CONFIG } from '../config/constants';
import { themes } from '../data/themes';
import mysqlConcepts from '../data/mysql-concepts.json';

const NavBar = ({ user, onNavigate, onLogout, onThemeChange }) => { // NavBar component: user info, navigation, logout, theme change callbacks
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown menu toggle state
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false); // Theme submenu toggle state
  const [isTopicOverlayOpen, setIsTopicOverlayOpen] = useState(false); // Topic overlay toggle state
  const [currentTheme, setCurrentTheme] = useState(THEME_CONFIG.DEFAULT_THEME); // Current theme state
  const dropdownRef = useRef(null); // Dropdown menu DOM reference

  useEffect(() => { // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_CONFIG.STORAGE_KEY) || THEME_CONFIG.DEFAULT_THEME;
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => { // Close dropdown and overlay when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsThemeMenuOpen(false);
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
    setIsThemeMenuOpen(false);
    onNavigate && onNavigate(ROUTES.PROFILE);
  };

  const handleLoginClick = () => { // Handle login navigation
    setIsDropdownOpen(false);
    setIsThemeMenuOpen(false);
    onNavigate && onNavigate(ROUTES.LOGIN);
  };

  const handleLogoutClick = () => { // Handle logout action
    setIsDropdownOpen(false);
    setIsThemeMenuOpen(false);
    onLogout && onLogout();
  };

  const handleThemeSelect = (themeId) => { // Handle theme selection
    setCurrentTheme(themeId);
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, themeId);
    setIsThemeMenuOpen(false);
    setIsDropdownOpen(false);
    onThemeChange && onThemeChange(themeId);
  };

  const handleTopicSelect = (concept) => { // Handle topic selection
    setIsTopicOverlayOpen(false);
    // You can add logic here to navigate to specific topic or handle selection
    console.log('Selected topic:', concept);
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
              SQL Tutor
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
                          <p className="text-xs text-gray-500 truncate">{user.email || '查看个人资料'}</p>
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
                      <span className="font-medium">个人资料</span>
                    </button>

                    {/* Choose Topic Button */}
                    <button
                      onClick={() => {
                        setIsTopicOverlayOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-medium">Choose Topic</span>
                    </button>

                    {/* Theme Selection */}
                    <div className="relative">
                      <button
                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center justify-between transition-all duration-150 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <Palette className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium">主题切换</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Theme Submenu */}
                      {isThemeMenuOpen && (
                        <div className="mx-2 mb-2 mt-1 bg-gray-50/80 rounded-xl p-2 space-y-1 max-h-64 overflow-y-auto">
                          {Object.entries(themes).map(([themeId, theme]) => (
                            <button
                              key={themeId}
                              onClick={() => handleThemeSelect(themeId)}
                              className={`w-full px-3 py-2.5 text-left text-sm rounded-lg flex items-center justify-between transition-all duration-150 ${
                                currentTheme === themeId
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'text-gray-700 hover:bg-white/80 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{theme.icon}</span>
                                <span className="font-medium">{theme.name}</span>
                              </div>
                              {currentTheme === themeId && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50/80 flex items-center space-x-3 transition-all duration-150 group"
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium">退出登录</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100/80 flex items-center space-x-3 transition-all duration-150 group"
                  >
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <LogIn className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">登录</span>
                  </button>
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
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-2xl w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Choose a Topic</h2>
                <p className="text-white/80">Select a MySQL concept to explore and practice</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mysqlConcepts.concepts.map((concept, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicSelect(concept)}
                    className="group p-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-colors">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-tight">
                        {concept.concept}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsTopicOverlayOpen(false)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-xl transition-all duration-200 font-medium hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
};

export default NavBar;

