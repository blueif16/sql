import axios from 'axios';
import { APP_CONFIG, USER_CONFIG } from '../config/constants';

const api = axios.create({ // Create axios instance with base config
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => { // Request interceptor: auto-add auth token
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
  login: (credentials) => api.post('/auth/login/', credentials), // User login
  logout: () => api.post('/auth/logout/'), // User logout
  register: (userData) => api.post('/auth/register/', userData), // User registration
  getProfile: () => api.get('/user/profile/'), // Get user profile
  updateProfile: (data) => api.put('/user/profile/', data), // Update user profile
  getSubmissions: (params) => api.get('/user/submissions/', { params }), // Get submission history
  getProblemStats: () => api.get('/user/problem-stats/'), // Get problem statistics
  getConceptStats: () => api.get('/user/concept-stats/'), // Get concept statistics
};

export const problemAPI = {
  getProblems: (params) => api.get('/problems/', { params }), // Get problem list
  getProblem: (id) => api.get(`/problems/${id}/`), // Get single problem
  submitQuery: (id, data) => api.post(`/problems/${id}/submit_query/`, data), // Submit SQL query
  getProgress: (id) => api.get(`/problems/${id}/progress/`), // Get problem progress
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

export const statsAPI = {
  getUserStats: () => api.get('/progress/stats/'), // Get user statistics
  getDailyActivity: () => api.get('/stats/daily-activity/'), // Get daily activity data
};

export default api;

