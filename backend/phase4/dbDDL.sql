CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    language VARCHAR(2) DEFAULT 'zh' CHECK (language IN ('en', 'zh')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'premium_user')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    difficulty_preference VARCHAR(20) DEFAULT 'easy' CHECK (difficulty_preference IN ('easy', 'medium', 'hard')),
    learning_style VARCHAR(20) DEFAULT 'guided' CHECK (learning_style IN ('guided', 'challenge', 'step_by_step')),
    interest_areas JSON,
    learned_concepts JSON,
    ui_theme VARCHAR(10) DEFAULT 'light' CHECK (ui_theme IN ('dark', 'light')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE concepts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    name_zh VARCHAR(100),
    name_en VARCHAR(100),
    description TEXT,
    description_zh TEXT,
    description_en TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisites JSON,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE interest_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name_zh VARCHAR(100),
    display_name_en VARCHAR(100),
    description_zh TEXT,
    description_en TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    primary_concept VARCHAR(50) NOT NULL,
    secondary_concepts JSON,
    interest_tags JSON,
    sql_schema JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_difficulty ON problems(difficulty);
CREATE INDEX idx_primary_concept ON problems(primary_concept);
CREATE INDEX idx_active ON problems(is_active);

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    sql_code TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_problem ON submissions(user_id, problem_id);
CREATE INDEX idx_user_time ON submissions(user_id, submitted_at);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    solved_problem_ids JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT s.problem_id) AS total_submissions,
    COUNT(DISTINCT CASE WHEN s.is_correct THEN s.problem_id END) AS correct_submissions,
    COALESCE(ROUND(COUNT(DISTINCT CASE WHEN s.is_correct THEN s.problem_id END)::NUMERIC / NULLIF(COUNT(DISTINCT s.problem_id), 0) * 100, 2), 0) AS accuracy_rate
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username, u.email;

CREATE OR REPLACE FUNCTION update_preference_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER preference_update_timestamp
BEFORE UPDATE ON preferences
FOR EACH ROW
EXECUTE FUNCTION update_preference_timestamp();

CREATE OR REPLACE FUNCTION get_user_difficulty_stats(p_user_id INT)
RETURNS TABLE(
    difficulty VARCHAR(20),
    total_problems BIGINT,
    solved_problems BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.difficulty,
        COUNT(DISTINCT p.id) AS total_problems,
        COUNT(DISTINCT CASE WHEN s.is_correct THEN p.id END) AS solved_problems
    FROM problems p
    LEFT JOIN submissions s ON p.id = s.problem_id AND s.user_id = p_user_id
    WHERE p.is_active = TRUE
    GROUP BY p.difficulty
    ORDER BY p.difficulty;
END;
$$ LANGUAGE plpgsql;

