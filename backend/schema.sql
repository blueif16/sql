-- LeetCode SQL 练习系统数据库架构
-- 极简化设计，专注核心功能

-- 用户基础表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    language ENUM('en','zh') DEFAULT 'zh',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户角色表
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role ENUM('admin','user','premium_user') DEFAULT 'user',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户偏好表（集中管理所有用户配置）
CREATE TABLE preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    difficulty_preference ENUM('easy','medium','hard') DEFAULT 'easy',
    learning_style ENUM('guided','challenge','step_by_step') DEFAULT 'guided',
    interest_areas JSON COMMENT 'Interest areas: ["movie","football","ecommerce"]',
    learned_concepts JSON COMMENT 'Learned concepts: ["JOINS","GROUP_BY"]',
    ui_theme ENUM('dark','light') DEFAULT 'light',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 问题表
CREATE TABLE problems (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('easy','medium','hard') NOT NULL,
    primary_concept VARCHAR(50) NOT NULL COMMENT 'Primary concept',
    secondary_concepts JSON COMMENT 'Secondary concepts: ["SUBQUERIES","ORDER_BY"]',
    interest_tags JSON COMMENT 'Interest tags: ["movie","entertainment"]',
    sql_schema JSON NOT NULL COMMENT 'Table schema and example data',
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_difficulty (difficulty),
    INDEX idx_primary_concept (primary_concept),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 提交表（极简）
CREATE TABLE submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    sql_code TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    INDEX idx_user_problem (user_id, problem_id),
    INDEX idx_user_time (user_id, submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户进度表（极简）
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    solved_problem_ids JSON COMMENT '已解决问题ID: [1,5,12,25]',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 示例数据插入
INSERT INTO users (email, username) VALUES 
('admin@test.com', 'admin'),
('user@test.com', 'testuser');

INSERT INTO user_roles (user_id, role) VALUES 
(1, 'admin'),
(2, 'user');

INSERT INTO preferences (user_id, interest_areas, learned_concepts) VALUES 
(1, '["database","system"]', '["SELECT","WHERE","JOINS"]'),
(2, '["movie","entertainment"]', '["SELECT","WHERE"]');

INSERT INTO problems (title, description, difficulty, primary_concept, secondary_concepts, interest_tags, sql_schema) VALUES 
('电影评分查询', '查询每部电影的平均评分', 'easy', 'GROUP_BY', '["AVG","SELECT"]', '["movie"]', '{"tables":{"movies":"CREATE TABLE movies(id INT, title VARCHAR(100), rating DECIMAL(3,1))","reviews":"CREATE TABLE reviews(movie_id INT, user_id INT, rating INT)"}}'),
('球员进球统计', '统计每个球员的总进球数', 'medium', 'JOINS', '["GROUP_BY","COUNT"]', '["football","sports"]', '{"tables":{"players":"CREATE TABLE players(id INT, name VARCHAR(50), team_id INT)","goals":"CREATE TABLE goals(id INT, player_id INT, match_id INT)"}}');

INSERT INTO user_progress (user_id, solved_problem_ids) VALUES 
(1, '[1]'),
(2, '[]');
