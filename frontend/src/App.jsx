import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import SQLLearningPlatform from './components/SQLLearningPlatform';
import ProfilePage from './components/ProfilePage';
import { USER_CONFIG, ROUTES, THEME_CONFIG } from './config/constants';
import './App.css';

function App() {
  const [currentRoute, setCurrentRoute] = useState(ROUTES.HOME); // Current route state
  const [user, setUser] = useState(null); // Current logged-in user information
  const [currentTheme, setCurrentTheme] = useState(THEME_CONFIG.DEFAULT_THEME); // Current theme state

  useEffect(() => { // Load user info from localStorage on mount
    const savedUser = localStorage.getItem(USER_CONFIG.SESSION_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user info:', e);
      }
    } else {
      setUser({ // Mock user data for demo, should fetch from backend in production
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com',
        created_at: '2025-10-01',
        language: 'en',
      });
    }
  }, []);

  useEffect(() => { // Load saved theme from localStorage on mount
    const savedTheme = localStorage.getItem(THEME_CONFIG.STORAGE_KEY) || THEME_CONFIG.DEFAULT_THEME;
    setCurrentTheme(savedTheme);
  }, []);

  const handleNavigate = (route) => { // Handle route navigation
    setCurrentRoute(route);
  };

  const handleLogout = () => { // Handle user logout
    localStorage.removeItem(USER_CONFIG.SESSION_KEY);
    setUser(null);
    setCurrentRoute(ROUTES.HOME);
  };

  const handleThemeChange = (themeId) => { // Handle theme change
    setCurrentTheme(themeId);
  };

  const renderContent = () => { // Render content based on current route
    switch (currentRoute) {
      case ROUTES.PROFILE:
        return <ProfilePage user={user} />;
      case ROUTES.HOME:
      default:
        return <SQLLearningPlatform currentTheme={currentTheme} onThemeChange={handleThemeChange} />;
    }
  };

  return (
    <div className="App h-screen flex flex-col">
      <NavBar user={user} onNavigate={handleNavigate} onLogout={handleLogout} onThemeChange={handleThemeChange} />
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
