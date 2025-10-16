export const APP_CONFIG = {
  APP_NAME: 'SQL Learning Platform', // Application name
  API_BASE_URL: 'http://localhost:8000/api', // Backend API base URL
  DEFAULT_LANGUAGE: 'en', // Default language
};

export const USER_CONFIG = {
  DEFAULT_AVATAR: 'https://api.dicebear.com/7.x/avataaars/svg?seed=', // Default avatar generation URL
  SESSION_KEY: 'sql_platform_user', // LocalStorage session key
};

export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  LOGIN: '/login',
};

export const SUBMISSION_STATUS = {
  CORRECT: 'correct', // Submission is correct
  INCORRECT: 'incorrect', // Submission is incorrect
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner', // Beginner level
  INTERMEDIATE: 'intermediate', // Intermediate level
  ADVANCED: 'advanced', // Advanced level
  EXPERT: 'expert', // Expert level
};

export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.BEGINNER]: 'text-emerald-600 bg-emerald-50 border border-emerald-200', // Green for beginner
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 'text-blue-600 bg-blue-50 border border-blue-200', // Blue for intermediate
  [DIFFICULTY_LEVELS.ADVANCED]: 'text-amber-600 bg-amber-50 border border-amber-200', // Orange for advanced
  [DIFFICULTY_LEVELS.EXPERT]: 'text-rose-600 bg-rose-50 border border-rose-200', // Red for expert
};

export const DIFFICULTY_LABELS = {
  [DIFFICULTY_LEVELS.BEGINNER]: 'Beginner',
  [DIFFICULTY_LEVELS.INTERMEDIATE]: 'Intermediate',
  [DIFFICULTY_LEVELS.ADVANCED]: 'Advanced',
  [DIFFICULTY_LEVELS.EXPERT]: 'Expert',
};

export const UI_CONFIG = {
  DROPDOWN_ANIMATION_DURATION: 200, // Dropdown animation duration (ms)
  TOAST_DURATION: 3000, // Toast message duration (ms)
  PAGE_SIZE: 10, // Pagination page size
};

export const THEME_CONFIG = {
  STORAGE_KEY: 'sql_platform_theme', // LocalStorage theme key
  DEFAULT_THEME: 'default', // Default theme ID
};

