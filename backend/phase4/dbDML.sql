INSERT INTO users (email, username, language, is_active) VALUES
('admin@test.com', 'admin', 'zh', TRUE),
('user1@test.com', 'alice_wang', 'zh', TRUE),
('user2@test.com', 'bob_chen', 'en', TRUE),
('user3@test.com', 'charlie_li', 'zh', TRUE),
('user4@test.com', 'diana_zhang', 'en', TRUE),
('user5@test.com', 'eric_liu', 'zh', TRUE),
('user6@test.com', 'fiona_wu', 'en', TRUE),
('user7@test.com', 'george_xu', 'zh', FALSE);

INSERT INTO user_roles (user_id, role) VALUES
(1, 'admin'),
(2, 'user'),
(3, 'premium_user'),
(4, 'user'),
(5, 'premium_user'),
(6, 'user'),
(7, 'user'),
(8, 'user');

INSERT INTO preferences (user_id, difficulty_preference, learning_style, interest_areas, learned_concepts, ui_theme) VALUES
(1, 'hard', 'challenge', '["database","system"]', '["SELECT","WHERE","JOINS","GROUP_BY"]', 'dark'),
(2, 'easy', 'guided', '["movie","entertainment"]', '["SELECT","WHERE"]', 'light'),
(3, 'medium', 'step_by_step', '["sports","football"]', '["SELECT","WHERE","JOINS"]', 'dark'),
(4, 'easy', 'guided', '["ecommerce","business"]', '["SELECT"]', 'light'),
(5, 'hard', 'challenge', '["finance","investment"]', '["SELECT","WHERE","JOINS","GROUP_BY","SUBQUERIES"]', 'dark'),
(6, 'medium', 'step_by_step', '["travel","tourism"]', '["SELECT","WHERE","GROUP_BY"]', 'light'),
(7, 'easy', 'guided', '["food","restaurant"]', '["SELECT","WHERE"]', 'light'),
(8, 'medium', 'challenge', '["technology","software"]', '["SELECT","JOINS"]', 'dark');

INSERT INTO concepts (name, name_zh, name_en, description, description_zh, description_en, difficulty_level, prerequisites) VALUES
('SELECT', '选择查询', 'SELECT Query', 'Basic data retrieval', '基本数据检索', 'Basic data retrieval', 'beginner', '[]'),
('WHERE', '条件筛选', 'WHERE Clause', 'Filter data with conditions', '使用条件过滤数据', 'Filter data with conditions', 'beginner', '["SELECT"]'),
('JOINS', '表连接', 'JOIN Operations', 'Combine data from multiple tables', '从多个表组合数据', 'Combine data from multiple tables', 'intermediate', '["SELECT","WHERE"]'),
('GROUP_BY', '分组聚合', 'GROUP BY Aggregation', 'Group and aggregate data', '分组和聚合数据', 'Group and aggregate data', 'intermediate', '["SELECT","WHERE"]'),
('HAVING', '分组过滤', 'HAVING Clause', 'Filter grouped data', '过滤分组后的数据', 'Filter grouped data', 'intermediate', '["GROUP_BY"]'),
('SUBQUERIES', '子查询', 'Subqueries', 'Nested queries', '嵌套查询', 'Nested queries', 'advanced', '["SELECT","WHERE","JOINS"]'),
('WINDOW_FUNCTIONS', '窗口函数', 'Window Functions', 'Advanced analytical functions', '高级分析函数', 'Advanced analytical functions', 'advanced', '["GROUP_BY"]'),
('CTE', '公用表表达式', 'Common Table Expressions', 'Temporary result sets', '临时结果集', 'Temporary result sets', 'advanced', '["SUBQUERIES"]');

INSERT INTO interest_areas (name, display_name_zh, display_name_en, description_zh, description_en, category) VALUES
('movie', '电影', 'Movies', '电影和娱乐相关的SQL问题', 'SQL problems about movies and entertainment', 'entertainment'),
('sports', '体育', 'Sports', '体育和比赛相关的SQL问题', 'SQL problems about sports and competitions', 'entertainment'),
('ecommerce', '电商', 'E-commerce', '电子商务和购物相关的SQL问题', 'SQL problems about e-commerce and shopping', 'business'),
('finance', '金融', 'Finance', '金融和投资相关的SQL问题', 'SQL problems about finance and investment', 'business'),
('travel', '旅游', 'Travel', '旅游和酒店相关的SQL问题', 'SQL problems about travel and hospitality', 'lifestyle'),
('food', '美食', 'Food', '餐饮和美食相关的SQL问题', 'SQL problems about food and restaurants', 'lifestyle'),
('technology', '科技', 'Technology', '科技和软件相关的SQL问题', 'SQL problems about technology and software', 'technology'),
('education', '教育', 'Education', '教育和学习相关的SQL问题', 'SQL problems about education and learning', 'education');

INSERT INTO problems (title, description, difficulty, primary_concept, secondary_concepts, interest_tags, sql_schema) VALUES
('Movie Rating Query', 'Query average rating for each movie', 'easy', 'GROUP_BY', '["AVG","SELECT"]', '["movie"]', '{"tables":{"movies":"CREATE TABLE movies(id INT, title VARCHAR(100), rating DECIMAL(3,1))","reviews":"CREATE TABLE reviews(movie_id INT, user_id INT, rating INT)"}}'),
('Player Goal Statistics', 'Calculate total goals for each player', 'medium', 'JOINS', '["GROUP_BY","COUNT"]', '["sports","football"]', '{"tables":{"players":"CREATE TABLE players(id INT, name VARCHAR(50), team_id INT)","goals":"CREATE TABLE goals(id INT, player_id INT, match_id INT)"}}'),
('Product Sales Ranking', 'Query top 10 products by sales', 'easy', 'SELECT', '["ORDER_BY","LIMIT"]', '["ecommerce"]', '{"tables":{"products":"CREATE TABLE products(id INT, name VARCHAR(100), sales INT)"}}'),
('User Spending Statistics', 'Calculate total spending amount for each user', 'medium', 'GROUP_BY', '["SUM","JOINS"]', '["ecommerce","finance"]', '{"tables":{"users":"CREATE TABLE users(id INT, name VARCHAR(50))","orders":"CREATE TABLE orders(id INT, user_id INT, amount DECIMAL(10,2))"}}'),
('High-Rated Movie Filter', 'Query movies with rating greater than 8.0', 'easy', 'WHERE', '["SELECT"]', '["movie"]', '{"tables":{"movies":"CREATE TABLE movies(id INT, title VARCHAR(100), rating DECIMAL(3,1))"}}'),
('Team Record Query', 'Calculate number of wins for each team', 'hard', 'SUBQUERIES', '["GROUP_BY","JOINS"]', '["sports"]', '{"tables":{"teams":"CREATE TABLE teams(id INT, name VARCHAR(50))","matches":"CREATE TABLE matches(id INT, home_team_id INT, away_team_id INT, winner_team_id INT)"}}'),
('Popular Attraction Recommendation', 'Query tourist attractions with highest ratings', 'medium', 'GROUP_BY', '["AVG","ORDER_BY"]', '["travel"]', '{"tables":{"attractions":"CREATE TABLE attractions(id INT, name VARCHAR(100))","ratings":"CREATE TABLE ratings(attraction_id INT, score INT)"}}'),
('Restaurant Dish Statistics', 'Count number of dishes for each restaurant', 'easy', 'GROUP_BY', '["COUNT"]', '["food"]', '{"tables":{"restaurants":"CREATE TABLE restaurants(id INT, name VARCHAR(100))","dishes":"CREATE TABLE dishes(id INT, restaurant_id INT, name VARCHAR(100))"}}');

INSERT INTO submissions (user_id, problem_id, sql_code, is_correct) VALUES
(2, 1, 'SELECT title, AVG(rating) FROM movies JOIN reviews ON movies.id = reviews.movie_id GROUP BY title', TRUE),
(2, 5, 'SELECT * FROM movies WHERE rating > 8.0', TRUE),
(3, 2, 'SELECT players.name, COUNT(*) FROM players JOIN goals ON players.id = goals.player_id GROUP BY players.name', TRUE),
(3, 1, 'SELECT title FROM movies', FALSE),
(4, 3, 'SELECT name FROM products ORDER BY sales DESC LIMIT 10', TRUE),
(5, 4, 'SELECT users.name, SUM(orders.amount) FROM users JOIN orders ON users.id = orders.user_id GROUP BY users.name', TRUE),
(5, 6, 'SELECT teams.name FROM teams WHERE id IN (SELECT winner_team_id FROM matches GROUP BY winner_team_id HAVING COUNT(*) > 10)', TRUE),
(6, 7, 'SELECT attractions.name, AVG(ratings.score) FROM attractions JOIN ratings ON attractions.id = ratings.attraction_id GROUP BY attractions.name ORDER BY AVG(ratings.score) DESC', TRUE),
(7, 8, 'SELECT restaurants.name, COUNT(dishes.id) FROM restaurants JOIN dishes ON restaurants.id = dishes.restaurant_id GROUP BY restaurants.name', TRUE),
(3, 8, 'SELECT * FROM restaurants', FALSE);

INSERT INTO user_progress (user_id, solved_problem_ids) VALUES
(1, '[]'),
(2, '[1,5]'),
(3, '[2]'),
(4, '[3]'),
(5, '[4,6]'),
(6, '[7]'),
(7, '[8]'),
(8, '[]');

