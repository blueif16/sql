import axios from 'axios';
import { APP_CONFIG, USER_CONFIG, LANGUAGE_CONFIG } from '../config/constants';

const api = axios.create({ // Create axios instance with base config
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 6000000, // 60秒超时，适应AI生成等耗时操作
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in cross-origin requests
});

// Helper function to get CSRF token from cookie
const getCsrfToken = () => {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

api.interceptors.request.use((config) => { // Request interceptor: auto-add auth token and CSRF token
  // Add CSRF token for non-GET requests
  if (config.method !== 'get') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  
  // Add auth token if exists
  const userStr = localStorage.getItem(USER_CONFIG.SESSION_KEY);
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Failed to parse user token:', e);
    }
  }
  
  // Add language header for localization
  const language = localStorage.getItem(LANGUAGE_CONFIG.STORAGE_KEY) || LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
  config.headers['Accept-Language'] = language;
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => { // Response interceptor: handle response data
  return response.data;
}, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem(USER_CONFIG.SESSION_KEY);
    window.location.href = '/';
  }
  return Promise.reject(error);
});

export const userAPI = {
  autoLogin: () => api.post('/auth/auto-login/'), // Auto login as guest user
  login: (credentials) => api.post('/auth/login/', credentials), // User login
  logout: () => api.post('/auth/logout/'), // User logout
  register: (userData) => api.post('/auth/register/', userData), // User registration
  getProfile: () => api.get('/user/profile/'), // Get user profile
  updateProfile: (data) => api.put('/user/profile/', data), // Update user profile
  updateLanguage: (language) => api.patch('/user/language/', { language }), // Update user language preference
};

export const preferenceAPI = {
  getPreferences: () => api.get('/preferences/me/'), // Get current user preferences
  updatePreferences: (data) => api.patch('/preferences/me/', data), // Update user preferences (partial update)
};

export const problemAPI = {
  getProblems: (params) => api.get('/problems/', { params }), // Get problem list
  getProblem: (id) => api.get(`/problems/${id}/`), // Get single problem
  submitQuery: (id, data) => api.post(`/problems/${id}/submit/`, data), // Submit SQL query
  getProgress: (id) => api.get(`/problems/${id}/progress/`), // Get problem progress
  generateProblem: (data) => api.post('/problems/generate/', data), // Generate new problem based on topic (auto-fetch user preferences)
};

export const themeAPI = {
  getThemes: () => api.get('/themes/'), // Get theme list
  getTheme: (id) => api.get(`/themes/${id}/`), // Get single theme
};

export const sectionAPI = {
  getSections: () => api.get('/sections/'), // Get section list
  getConcepts: (sectionId) => api.get(`/sections/${sectionId}/concepts/`), // Get section concepts
  getProblems: (conceptId) => api.get(`/concepts/${conceptId}/problems/`), // Get concept problems
};

export const conceptAPI = {
  getConcepts: () => api.get('/concepts/'), // Get all concepts
  getConcept: (id) => api.get(`/concepts/${id}/`), // Get concept details by id
  getConceptsWithProgress: () => api.get('/concepts/with_progress/'), // Get concepts grouped by difficulty with user progress
};

export const interestAPI = {
  getInterests: (params) => api.get('/interests/', { params }), // Get all interest areas
  getInterest: (id) => api.get(`/interests/${id}/`), // Get interest area details by id
};

export const statsAPI = {
  getUserStats: () => api.get('/progress/stats/'), // Get user statistics
  getDailyActivity: () => api.get('/stats/daily-activity/'), // Get daily activity data
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message/', data), // Send chat message (non-streaming)
  getHistory: (threadId) => api.get('/chat/history/', { params: { thread_id: threadId } }), // Get chat history
  getThreads: () => api.get('/chat/threads/'), // Get user chat threads
  evaluateSolution: (data) => api.post('/chat/evaluate_solution/', data), // Evaluate SQL solution
  streamMessage: async (data, onChunk, onDone, onError) => { // Stream chat message
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add CSRF token for non-GET requests
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      }
      
      // Add auth token if exists
      const userStr = localStorage.getItem(USER_CONFIG.SESSION_KEY);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
          }
        } catch (e) {
          console.error('Failed to parse user token:', e);
        }
      }
      
      // Add language header
      const language = localStorage.getItem(LANGUAGE_CONFIG.STORAGE_KEY) || LANGUAGE_CONFIG.DEFAULT_LANGUAGE;
      headers['Accept-Language'] = language;
      
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}/chat/stream/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onDone?.();
              return;
            }
            try {
              const json = JSON.parse(data);
              onChunk?.(json.chunk);
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      onError?.(error);
    }
  }
};

export default api;

