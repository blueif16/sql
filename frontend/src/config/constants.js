export const APP_CONFIG = {
  APP_NAME: 'SQL Learning Platform', // Application name
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', // Backend API base URL (default: dev mode)
  DEFAULT_LANGUAGE: 'en', // Default language
  IS_DEV: import.meta.env.DEV, // Development mode flag
};

export const USER_CONFIG = {
  DEFAULT_AVATAR: 'https://api.dicebear.com/7.x/avataaars/svg?seed=', // Default avatar generation URL
  SESSION_KEY: 'sql_platform_user', // LocalStorage session key
};

export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  LOGIN: '/login',
  PROBLEM: '/problem', // Problem detail page
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

export const CHAT_CONFIG = {
  USE_AI_CHATBOT: true, // Enable AI chatbot
  USE_STREAMING: true, // Use streaming for AI responses
  STORAGE_KEY: 'sql_platform_chat_thread', // LocalStorage key for chat thread ID
  DEFAULT_LANGUAGE: 'en', // Default language for chatbot
};

export const THEME_CONFIG = {
  STORAGE_KEY: 'sql_platform_theme', // LocalStorage theme key
  DEFAULT_THEME: 'default', // Default theme ID
};

export const LANGUAGE_CONFIG = {
  STORAGE_KEY: 'sql_platform_language', // LocalStorage language key
  DEFAULT_LANGUAGE: 'en', // Default language
  LANGUAGES: ['en'], // Supported languages
};

export const UI_TEXTS = { // UI text translations
  en: {
    navbar: {
      appName: 'SQL Tutor',
      profile: 'Profile',
      chooseTopic: 'Choose Topic',
      logout: 'Logout',
      login: 'Login',
      viewProfile: 'View Profile',
      chooseTopicTitle: 'Choose Your SQL Concepts',
      selectTopics: (count) => `Select topics you are interested in (${count} selected)`,
      generating: 'AI is generating problem, please wait...',
      saving: 'Saving preferences...',
      loading: 'Loading concepts...',
      beginner: 'Beginner',
      beginnerDesc: 'Basic Concepts',
      intermediate: 'Intermediate',
      intermediateDesc: 'Intermediate Concepts',
      advanced: 'Advanced',
      advancedDesc: 'Advanced Concepts',
      savePreferences: 'Save Preferences',
      generateProblem: 'Generate Problem',
      close: 'Close',
      generatingMsg: 'Generating problem...',
      savingMsg: 'Saving preferences...',
      loadingMsg: 'Loading concepts...',
      waitMsg: 'This may take a few seconds',
      loginFirst: 'Please login first',
      selectAtLeastOne: 'Please select at least one topic',
      generateSuccess: 'Problem generated successfully! Redirecting...',
      generateFailed: 'Failed to generate problem, please try again',
      saveFailed: 'Failed to save preferences: ',
      saveSuccess: 'Preferences saved!',
      loadFailed: 'Failed to load concepts: ',
      unknownError: 'Unknown error',
    },
    homePage: {
      title: 'SQL Learning Platform',
      subtitle: 'Choose an SQL concept to practice, or set your interest areas for more personalized problems',
      tabConcepts: 'Select SQL Concepts',
      tabInterests: 'Manage Interest Areas',
      difficultyBeginner: 'Beginner',
      difficultyIntermediate: 'Intermediate',
      difficultyAdvanced: 'Advanced',
      conceptsCount: (count) => `${count} concepts`,
      noConcepts: 'No concepts available at this difficulty level',
      generating: 'Generating problem...',
      generatingSubtitle: 'AI is creating a personalized SQL practice problem for you',
      interestExplainTitle: '💡 Why set interest areas?',
      interestExplainText: 'Choose data scenarios you are interested in, and AI will generate problems that are more relevant to real-world applications. For example, if you choose "Movies", problems will include data about movies, actors, box office, etc.',
      categoryEntertainment: 'Entertainment',
      categorySports: 'Sports',
      categoryBusiness: 'Business',
      categoryTechnology: 'Technology',
      categoryEducation: 'Education',
      categoryTravel: 'Travel',
      categoryHealth: 'Health',
      saveInterests: 'Save Interest Preferences',
      saving: 'Saving...',
      confirmNoInterest: 'You haven\'t selected any interest areas yet, problems will use generic data scenarios. Continue?\n\nWe recommend setting interest areas first for more relevant content.',
      savedSuccess: 'Interest preferences saved!',
      saveFailed: 'Save failed: ',
      generateFailed: 'Problem generation failed: ',
      unknownError: 'Unknown error',
    },
    problemPanel: {
      tabPractice: 'Practice',
      tabLearn: 'Learn',
    },
    dataTable: {
      noData: 'No data',
    },
    galleryView: {
      title: 'SQL Learning Path',
      subtitle: 'Choose a concept to start learning SQL',
      difficultyBeginner: 'Beginner',
      difficultyIntermediate: 'Intermediate',
      difficultyAdvanced: 'Advanced',
      conceptsCount: (count) => `${count} concepts`,
      completedCount: (solved, total) => `${solved}/${total} completed`,
      noConcepts: 'No concepts available at this difficulty level',
      loading: 'Loading concepts...',
    },
    learnTab: {
      noConcept: 'Please select a concept from the concept gallery first',
      conceptDescription: 'Concept Description',
      syntaxExample: 'Syntax Example:',
      examples: 'Examples:',
      keyPoints: 'Key Points:',
      prerequisites: 'Prerequisites:',
      learningProgress: 'Learning Progress:',
      problems: 'problems',
      learningTips: 'Learning Tips:',
      tip1: 'Carefully read the concept description to understand the core principles',
      tip2: 'Try running the syntax example and observe the output',
      tip3: 'Switch to Practice tab for hands-on exercises',
      tip4: 'Use the Ask Tutor feature when you need help',
    },
    aiChat: {
      initProblemMessage: 'I want to start working on this problem, please briefly introduce the key points.',
      welcomeWithProblem: 'Hello! Please introduce how to use this learning assistant.',
      welcomeGeneral: 'Hello! Please introduce yourself.',
      fallbackWelcomeWithProblem: 'Hello! I am your SQL learning assistant. I can help you understand this problem, answer SQL questions, or analyze your queries. How can I help you?',
      fallbackWelcomeGeneral: 'Hello! I am your SQL learning assistant. I can answer SQL questions and help you learn SQL. Ask me anything!',
      querySubmitted: 'I have submitted the query for you, please check the results comparison on the right.',
      errorMessage: 'Sorry, something went wrong. Please try again later.',
      thinking: 'Thinking...',
      modeAsk: 'Q&A Mode',
      modeSolve: 'Solve Mode',
      placeholderSolve: 'Enter SQL query...',
      placeholderAsk: 'Ask me any SQL question...',
      send: 'Send',
      evaluationTitle: 'Solution Evaluation',
      correctTitle: 'Correct Solution!',
      incorrectTitle: 'Incorrect Solution',
      explanation: 'Explanation',
      close: 'Close',
      askForHelp: 'Ask for Help',
    }
  },
};

