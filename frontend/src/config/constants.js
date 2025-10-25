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
  DEFAULT_LANGUAGE: 'zh', // Default language for chatbot
};

export const THEME_CONFIG = {
  STORAGE_KEY: 'sql_platform_theme', // LocalStorage theme key
  DEFAULT_THEME: 'default', // Default theme ID
};

export const LANGUAGE_CONFIG = {
  STORAGE_KEY: 'sql_platform_language', // LocalStorage language key
  DEFAULT_LANGUAGE: 'en', // Default language
  LANGUAGES: ['en', 'zh'], // Supported languages
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
    }
  },
  zh: {
    navbar: {
      appName: 'SQL Tutor',
      profile: '个人资料',
      chooseTopic: '选择主题',
      logout: '退出登录',
      login: '登录',
      viewProfile: '查看个人资料',
      chooseTopicTitle: '选择你的SQL概念',
      selectTopics: (count) => `选择你感兴趣的主题 (已选择 ${count} 个)`,
      generating: 'AI正在为您生成题目，请稍候...',
      saving: '正在保存偏好...',
      loading: '正在加载概念...',
      beginner: 'Beginner',
      beginnerDesc: '基础概念',
      intermediate: 'Intermediate',
      intermediateDesc: '进阶概念',
      advanced: 'Advanced',
      advancedDesc: '高级概念',
      savePreferences: '保存偏好',
      generateProblem: '生成题目',
      close: '关闭',
      generatingMsg: '正在生成题目...',
      savingMsg: '正在保存偏好...',
      loadingMsg: '正在加载概念...',
      waitMsg: '这可能需要几秒钟',
      loginFirst: '请先登录后再生成题目',
      selectAtLeastOne: '请至少选择一个感兴趣的主题',
      generateSuccess: '题目生成成功！正在跳转...',
      generateFailed: '题目生成失败，请重试',
      saveFailed: '保存失败：',
      saveSuccess: '兴趣偏好已保存！',
      loadFailed: '加载概念失败：',
      unknownError: '未知错误',
    },
    homePage: {
      title: 'SQL 学习平台',
      subtitle: '选择一个 SQL 概念开始练习，或设置你的兴趣领域以获得更个性化的题目',
      tabConcepts: '选择 SQL 概念',
      tabInterests: '管理兴趣领域',
      difficultyBeginner: '基础',
      difficultyIntermediate: '进阶',
      difficultyAdvanced: '高级',
      conceptsCount: (count) => `${count} 个概念`,
      noConcepts: '该难度级别暂无概念',
      generating: '正在生成题目...',
      generatingSubtitle: 'AI 正在为你创建个性化的 SQL 练习题',
      interestExplainTitle: '💡 为什么要设置兴趣领域？',
      interestExplainText: '选择你感兴趣的数据场景，AI 会根据你的兴趣生成更贴近实际应用的题目。例如，如果你选择"电影"，题目会包含电影、演员、票房等相关数据。',
      categoryEntertainment: '娱乐',
      categorySports: '体育',
      categoryBusiness: '商业',
      categoryTechnology: '技术',
      categoryEducation: '教育',
      categoryTravel: '旅游',
      categoryHealth: '健康',
      saveInterests: '保存兴趣偏好',
      saving: '保存中...',
      confirmNoInterest: '你还没有选择兴趣领域，题目将使用通用数据场景。是否继续？\n\n建议先设置兴趣领域，题目会更贴近你感兴趣的内容。',
      savedSuccess: '兴趣偏好已保存！',
      saveFailed: '保存失败：',
      generateFailed: '题目生成失败：',
      unknownError: '未知错误',
    },
    problemPanel: {
      tabPractice: '练习',
      tabLearn: '学习',
    },
    dataTable: {
      noData: '暂无数据',
    },
    galleryView: {
      title: 'SQL Learning Path',
      subtitle: '选择一个概念开始学习 SQL',
      difficultyBeginner: '基础',
      difficultyIntermediate: '进阶',
      difficultyAdvanced: '高级',
      conceptsCount: (count) => `${count} 个概念`,
      completedCount: (solved, total) => `${solved}/${total} 已完成`,
      noConcepts: '该难度级别暂无概念',
      loading: '加载概念中...',
    },
    learnTab: {
      noConcept: '请先从概念画廊中选择一个概念',
      conceptDescription: '概念说明',
      syntaxExample: '语法示例:',
      examples: '示例：',
      keyPoints: '要点：',
      prerequisites: '前置知识:',
      learningProgress: '学习进度:',
      problems: '题',
      learningTips: '学习建议:',
      tip1: '仔细阅读概念说明，理解核心原理',
      tip2: '尝试运行语法示例，观察输出结果',
      tip3: '切换到 Practice 标签页进行实战练习',
      tip4: '遇到困难可以使用 Ask Tutor 功能寻求帮助',
    },
    aiChat: {
      initProblemMessage: '我想开始做这道题，请简单介绍一下这道题目的要点。',
      welcomeWithProblem: '你好！请介绍一下如何使用这个学习助手。',
      welcomeGeneral: '你好！请介绍一下你自己。',
      fallbackWelcomeWithProblem: '你好！我是SQL学习助手。我可以帮你理解这道题目，解答SQL相关问题，或者分析你的查询。有什么我可以帮你的吗？',
      fallbackWelcomeGeneral: '你好！我是SQL学习助手。我可以回答SQL相关的问题，帮助你学习SQL知识。问我任何问题吧！',
      querySubmitted: '我已经帮你提交了查询，请查看右侧的结果对比。',
      errorMessage: '抱歉，出现了一些问题。请稍后再试。',
      thinking: '思考中...',
      modeAsk: '问答模式',
      modeSolve: '解题模式',
      placeholderSolve: '输入SQL查询...',
      placeholderAsk: '问我任何SQL问题...',
      send: '发送',
    }
  }
};

