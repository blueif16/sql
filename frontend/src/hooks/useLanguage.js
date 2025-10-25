import { useState, useEffect } from 'react';
import { LANGUAGE_CONFIG, UI_TEXTS, USER_CONFIG } from '../config/constants';

export const useLanguage = () => { // Custom hook for language management
  const [language, setLanguageState] = useState(() => { // Initialize from user data, localStorage, or default
    // 优先从localStorage读取用户语言
    const savedLang = localStorage.getItem(LANGUAGE_CONFIG.STORAGE_KEY);
    if (savedLang && LANGUAGE_CONFIG.LANGUAGES.includes(savedLang)) {
      return savedLang;
    }
    // 如果没有，尝试从用户数据读取
    try {
      const userStr = localStorage.getItem(USER_CONFIG.SESSION_KEY);
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.language && LANGUAGE_CONFIG.LANGUAGES.includes(user.language)) {
          localStorage.setItem(LANGUAGE_CONFIG.STORAGE_KEY, user.language);
          return user.language;
        }
      }
    } catch (e) {
      console.error('Failed to parse user language:', e);
    }
    // 最后使用默认值
    return LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
  });

  useEffect(() => { // Listen for language change events
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail.language;
      if (newLanguage && LANGUAGE_CONFIG.LANGUAGES.includes(newLanguage)) {
        setLanguageState(newLanguage);
      }
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const setLanguage = (lang) => { // Set language and save to localStorage
    if (LANGUAGE_CONFIG.LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem(LANGUAGE_CONFIG.STORAGE_KEY, lang);
    }
  };

  const toggleLanguage = () => { // Toggle between languages
    const currentIndex = LANGUAGE_CONFIG.LANGUAGES.indexOf(language);
    const nextIndex = (currentIndex + 1) % LANGUAGE_CONFIG.LANGUAGES.length;
    setLanguage(LANGUAGE_CONFIG.LANGUAGES[nextIndex]);
  };

  const t = (section) => UI_TEXTS[language][section]; // Get translations for current language

  return { language, setLanguage, toggleLanguage, t };
};

