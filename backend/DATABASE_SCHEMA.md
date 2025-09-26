# LeetCode SQL 练习系统数据库设计

## 系统概述
基于概念驱动和兴趣定制的SQL练习平台，支持个性化学习路径和进度追踪。

## 核心功能
- 🎯 **概念导向学习**: 基于已学概念推荐下一步学习内容
- 🏷️ **兴趣定制**: 支持电影、足球等主题的SQL问题
- 📊 **简化进度追踪**: 记录已解决问题ID列表
- 👤 **用户偏好管理**: 集中化偏好配置系统
- 🔐 **角色权限**: admin/user/premium_user权限管控

## 数据库架构

### 用户管理
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role ENUM('admin','user','premium_user') DEFAULT 'user',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    difficulty_preference ENUM('easy','medium','hard','adaptive') DEFAULT 'easy',
    learning_style ENUM('guided','challenge','step_by_step') DEFAULT 'guided',
    interest_areas JSON, -- ['movie','football','ecommerce']
    learned_concepts JSON, -- ['JOINS','GROUP_BY','WINDOW_FUNCTIONS']
    ui_theme ENUM('dark','light') DEFAULT 'light',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 题目管理
```sql
CREATE TABLE problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('easy','medium','hard') NOT NULL,
    primary_concept VARCHAR(50) NOT NULL, -- 'JOINS','GROUP_BY' etc
    secondary_concepts JSON, -- ['SUBQUERIES','ORDER_BY']
    interest_tags JSON, -- ['movie','entertainment']
    sql_schema JSON NOT NULL, -- 表结构定义和示例数据
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_difficulty (difficulty),
    INDEX idx_primary_concept (primary_concept)
);
```

### 练习系统
```sql
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    sql_code TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_user_problem (user_id, problem_id)
);

CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    solved_problem_ids JSON, -- [1,5,12,25] 已解决问题ID数组
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 核心逻辑

### 概念推荐算法
```python
ALL_CONCEPTS = ['SELECT','WHERE','JOINS','GROUP_BY','HAVING','SUBQUERIES','WINDOW_FUNCTIONS','CTE']

def get_next_concept(user_id):
    learned = get_user_learned_concepts(user_id) # 从preferences获取
    remaining = set(ALL_CONCEPTS) - set(learned)
    return next(iter(remaining)) if remaining else None
```

### 问题推荐逻辑  
1. 获取用户下一个学习概念
2. 匹配用户兴趣标签
3. 过滤已解决问题
4. 按难度偏好排序

## 性能优化
- `user_id` 相关查询添加复合索引
- JSON字段用于灵活存储，减少关联查询
- 极简化表结构，提升查询效率
- 单表存储用户进度，避免复杂JOIN操作

## 扩展性
- 兴趣标签支持任意自定义主题
- 概念体系可动态扩展
- JSON字段支持未来功能扩展
- 角色系统支持权限细分
