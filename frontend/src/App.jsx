import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import { HomePage, ProblemDetailPage, ProfilePage } from './pages';
import { USER_CONFIG, ROUTES } from './config/constants';
import { userAPI } from './services/api';
import './App.css';

function AppContent() { // Main app content with routing
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null); // Current logged-in user information
  const [isLoggingIn, setIsLoggingIn] = useState(true); // Auto-login loading state

  useEffect(() => { // Auto-login on mount
    const autoLogin = async () => {
      try {
        const response = await userAPI.autoLogin();
        const userData = response.user;
        setUser(userData);
        localStorage.setItem(USER_CONFIG.SESSION_KEY, JSON.stringify(userData));
        // 同步用户语言设置到localStorage
        if (userData.language) {
          localStorage.setItem('sql_platform_language', userData.language);
          // 触发自定义事件通知语言变更
          window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: userData.language } }));
        }
        console.log('自动登录成功:', userData);
      } catch (error) {
        console.error('自动登录失败:', error);
        setUser(null);
      } finally {
        setIsLoggingIn(false);
      }
    };

    autoLogin();
  }, []);

  const handleNavigate = (route, params = {}) => { // Handle route navigation with optional parameters
    if (route === ROUTES.PROBLEM && params.problemId) {
      navigate(`${route}?id=${params.problemId}`);
    } else {
      navigate(route);
    }
  };

  const handleLogout = () => { // Handle user logout
    localStorage.removeItem(USER_CONFIG.SESSION_KEY);
    setUser(null);
    navigate(ROUTES.HOME);
  };

  if (isLoggingIn) { // Show loading while auto-login
    return (
      <div className="App h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App h-screen flex flex-col">
      <NavBar 
        user={user} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
      />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route 
            path={ROUTES.HOME} 
            element={<HomePage />} 
          />
          <Route 
            path={ROUTES.PROBLEM} 
            element={<ProblemDetailPage />} 
          />
          <Route 
            path={ROUTES.PROFILE} 
            element={<ProfilePage user={user} />} 
          />
          <Route 
            path="*" 
            element={<HomePage />} 
          />
        </Routes>
      </div>
    </div>
  );
}

function App() { // Root app component with router
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
