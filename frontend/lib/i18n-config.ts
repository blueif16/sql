//双语配置文件
export const langs=['en','zh'] as const//支持语言
export type Lang=typeof langs[number]//语言类型

export const translations={
  en:{//英文翻译
    common:{
      next:'Next',
      prev:'Previous',
      complete:'Complete Setup',
      save:'Save',
      cancel:'Cancel',
      saving:'Saving...',
      required:'Required',
      optional:'Optional'
    },
    auth:{
      title:'Welcome to LeetCode SQL',
      subtitle:'Let\'s get you started with your SQL learning journey',
      email:'Email Address',
      username:'Username',
      language:'Preferred Language',
      emailPlaceholder:'Enter your email',
      usernamePlaceholder:'Choose a username',
      continue:'Continue to Setup',
      validation:{
        emailRequired:'Email is required',
        usernameRequired:'Username is required',
        languageRequired:'Please select a language'
      }
    },
    onboarding:{
      title:'Personalize Your Experience',
      steps:['Difficulty','Learning','Interests','Concepts','Theme'],
      difficulty:{
        title:'Choose Difficulty Preference',
        desc:'We\'ll recommend problems based on your preference',
        easy:'Easy',
        medium:'Medium',
        hard:'Hard',
        adaptive:'Adaptive',
        easyDesc:'Perfect for beginners, basic SQL syntax',
        mediumDesc:'Some experience required, complex queries',
        hardDesc:'Advanced SQL, complex business logic',
        adaptiveDesc:'Dynamically adjusts based on your performance'
      },
      learning:{
        title:'Choose Learning Style',
        desc:'Select the learning approach that suits you best',
        guided:'Guided',
        challenge:'Challenge',
        stepByStep:'Step by Step',
        guidedDesc:'Step-by-step hints with detailed explanations',
        challengeDesc:'Direct challenges, learn through exploration',
        stepByStepDesc:'Progressive learning, master skills gradually'
      },
      interests:{
        title:'Choose Interest Areas',
        desc:'Select topics you\'re interested in for relevant problems',
        movie:'Movies',
        football:'Football',
        ecommerce:'E-commerce',
        database:'Database',
        system:'System',
        entertainment:'Entertainment',
        sports:'Sports'
      },
      concepts:{
        title:'Select Mastered Concepts',
        desc:'Tell us which SQL concepts you already know'
      },
      theme:{
        title:'Choose Interface Theme',
        desc:'Select your preferred interface style',
        light:'Light Theme',
        dark:'Dark Theme'
      },
      complete:{
        title:'Setup Complete!',
        subtitle:'We\'ve configured your personalized learning environment',
        summary:'Your Learning Preferences:',
        difficulty:'Difficulty:',
        learning:'Learning Style:',
        interests:'Interests:',
        concepts:'Mastered Concepts:',
        theme:'Theme:',
        start:'Start Learning SQL',
        note:'You can modify these preferences anytime in settings'
      }
    }
  },
  zh:{//中文翻译  
    common:{
      next:'下一步',
      prev:'上一步',
      complete:'完成设置',
      save:'保存',
      cancel:'取消',
      saving:'保存中...',
      required:'必填',
      optional:'可选'
    },
    auth:{
      title:'欢迎使用 LeetCode SQL',
      subtitle:'让我们开始您的SQL学习之旅',
      email:'邮箱地址',
      username:'用户名',
      language:'首选语言',
      emailPlaceholder:'请输入邮箱',
      usernamePlaceholder:'请选择用户名',
      continue:'继续设置',
      validation:{
        emailRequired:'请输入邮箱',
        usernameRequired:'请输入用户名',
        languageRequired:'请选择语言'
      }
    },
    onboarding:{
      title:'个性化设置',
      steps:['难度','学习','兴趣','概念','主题'],
      difficulty:{
        title:'选择难度偏好',
        desc:'我们将根据您的偏好推荐合适的题目',
        easy:'简单',
        medium:'中等',
        hard:'困难',
        adaptive:'自适应',
        easyDesc:'适合初学者，基础SQL语法',
        mediumDesc:'有一定基础，复合查询',
        hardDesc:'高级SQL，复杂业务逻辑',
        adaptiveDesc:'根据答题情况动态调整'
      },
      learning:{
        title:'选择学习方式',
        desc:'选择最适合您的学习风格',
        guided:'引导式',
        challenge:'挑战式',
        stepByStep:'逐步式',
        guidedDesc:'逐步提示，详细解释',
        challengeDesc:'直接挑战，自主探索',
        stepByStepDesc:'分步骤学习，循序渐进'
      },
      interests:{
        title:'选择兴趣领域',
        desc:'选择您感兴趣的领域，我们会推荐相关题目',
        movie:'电影',
        football:'足球',
        ecommerce:'电商',
        database:'数据库',
        system:'系统',
        entertainment:'娱乐',
        sports:'体育'
      },
      concepts:{
        title:'选择已掌握概念',
        desc:'告诉我们您已经掌握的SQL概念'
      },
      theme:{
        title:'选择界面主题',
        desc:'选择您喜欢的界面风格',
        light:'浅色主题',
        dark:'深色主题'
      },
      complete:{
        title:'设置完成！',
        subtitle:'我们已经根据您的偏好配置了个性化的学习环境',
        summary:'您的学习偏好：',
        difficulty:'难度偏好：',
        learning:'学习方式：',
        interests:'兴趣领域：',
        concepts:'已掌握概念：',
        theme:'界面主题：',
        start:'开始学习SQL',
        note:'您可以随时在设置中修改这些偏好'
      }
    }
  }
}

export const getTranslation=(lang:Lang)=>translations[lang]//获取翻译
