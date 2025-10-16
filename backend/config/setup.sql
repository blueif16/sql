-- SQL Learning Platform Database Schema
-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS daily_activity CASCADE;
DROP TABLE IF EXISTS user_concept_stats CASCADE;
DROP TABLE IF EXISTS user_problem_stats CASCADE;
DROP TABLE IF EXISTS AI_guidance_history CASCADE;
DROP TABLE IF EXISTS Submissions CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS preferences CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS concept CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS learn_style CASCADE;
DROP TABLE IF EXISTS difficulty CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create user_roles table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_name)
);

-- Create difficulty lookup table
CREATE TABLE difficulty (
    id SERIAL PRIMARY KEY,
    level VARCHAR(50) UNIQUE NOT NULL
);

-- Create learn_style lookup table
CREATE TABLE learn_style (
    id SERIAL PRIMARY KEY,
    style VARCHAR(100) UNIQUE NOT NULL
);

-- Create interests lookup table
CREATE TABLE interests (
    id SERIAL PRIMARY KEY,
    interest VARCHAR(100) UNIQUE NOT NULL
);

-- Create concept lookup table
CREATE TABLE concept (
    id SERIAL PRIMARY KEY,
    concept VARCHAR(100) UNIQUE NOT NULL
);

-- Create preferences table
CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    difficulty_id INTEGER,
    learn_style_id INTEGER,
    interests_id INTEGER,
    learned_concept_id INTEGER,
    ui_theme VARCHAR(50) DEFAULT 'light',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulty(id) ON DELETE SET NULL,
    FOREIGN KEY (learn_style_id) REFERENCES learn_style(id) ON DELETE SET NULL,
    FOREIGN KEY (interests_id) REFERENCES interests(id) ON DELETE SET NULL,
    FOREIGN KEY (learned_concept_id) REFERENCES concept(id) ON DELETE SET NULL
);

-- Create problems table
CREATE TABLE problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    primary_concept VARCHAR(100),
    secondary_concepts TEXT[], -- Array of concepts
    interest_tags TEXT[], -- Array of interest tags
    sql_schema TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create Submissions table
CREATE TABLE Submissions (
    id SERIAL PRIMARY KEY,
    problem_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    sql_code TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hints_used INTEGER DEFAULT 0,
    time_spent_seconds INTEGER,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create AI_guidance_history table
CREATE TABLE AI_guidance_history (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    AI_feedback TEXT NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES Submissions(id) ON DELETE CASCADE
);

-- Create user_problem_stats table
CREATE TABLE user_problem_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    problem_id INTEGER NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    first_attempt_at TIMESTAMP,
    first_pass_at TIMESTAMP,
    attempts_until_pass INTEGER,
    total_hints_used INTEGER DEFAULT 0,
    best_time_seconds INTEGER,
    last_attempt_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
    UNIQUE(user_id, problem_id)
);

-- Create user_concept_stats table
CREATE TABLE user_concept_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    concept_id INTEGER NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2),
    avg_time_seconds DECIMAL(10,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (concept_id) REFERENCES concept(id) ON DELETE CASCADE,
    UNIQUE(user_id, concept_id)
);

-- Create daily_activity table
CREATE TABLE daily_activity (
    date DATE PRIMARY KEY,
    active_users INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_preferences_user_id ON preferences(user_id);
CREATE INDEX idx_submissions_user_id ON Submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON Submissions(problem_id);
CREATE INDEX idx_submissions_submitted_at ON Submissions(submitted_at);
CREATE INDEX idx_user_problem_stats_user_id ON user_problem_stats(user_id);
CREATE INDEX idx_user_problem_stats_problem_id ON user_problem_stats(problem_id);
CREATE INDEX idx_user_concept_stats_user_id ON user_concept_stats(user_id);
CREATE INDEX idx_user_concept_stats_concept_id ON user_concept_stats(concept_id);
CREATE INDEX idx_ai_guidance_submission_id ON AI_guidance_history(submission_id);

-- Insert some default lookup values
INSERT INTO difficulty (level) VALUES 
    ('beginner'),
    ('intermediate'),
    ('advanced'),
    ('expert');

INSERT INTO learn_style (style) VALUES 
    ('visual'),
    ('hands-on'),
    ('reading'),
    ('guided');

-- Add comments to tables for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE problems IS 'SQL problems/challenges for users to solve';
COMMENT ON TABLE Submissions IS 'User submissions for problems';
COMMENT ON TABLE user_problem_stats IS 'Aggregated statistics per user per problem';
COMMENT ON TABLE user_concept_stats IS 'Aggregated statistics per user per SQL concept';
COMMENT ON TABLE daily_activity IS 'Daily platform usage metrics';