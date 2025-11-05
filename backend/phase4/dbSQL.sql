-- Query 1: Join users with their roles and preferences
-- Find all active users with premium membership and their preferred difficulty
-- Expected: Returns username, email, role, difficulty preference for premium users
SELECT u.username, u.email, ur.role, p.difficulty_preference
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN preferences p ON u.id = p.user_id
WHERE ur.role = 'premium_user' AND u.is_active = TRUE;

-- Query 2: Aggregate query with GROUP BY and HAVING: Find users who have solved more than 1 problem
-- Expected: Returns username and count of solved problems for users with 2+ solutions
SELECT u.username, COUNT(DISTINCT s.problem_id) AS problems_solved
FROM users u
INNER JOIN submissions s ON u.id = s.user_id
WHERE s.is_correct = TRUE
GROUP BY u.id, u.username
HAVING COUNT(DISTINCT s.problem_id) > 1
ORDER BY problems_solved DESC;

-- Query 3: Complex join with 3 tables and aggregation
-- Calculate success rate per difficulty level
-- Expected: Shows difficulty, total submissions, correct submissions, and success rate percentage
SELECT p.difficulty, 
       COUNT(s.id) AS total_submissions,
       SUM(CASE WHEN s.is_correct THEN 1 ELSE 0 END) AS correct_submissions,
       ROUND(AVG(CASE WHEN s.is_correct THEN 100.0 ELSE 0.0 END), 2) AS success_rate
FROM problems p
INNER JOIN submissions s ON p.id = s.problem_id
GROUP BY p.difficulty
ORDER BY success_rate DESC;

-- Query 4: Subquery to find problems with no submissions
-- Find all active problems that have never been attempted
-- Expected: Returns problem id, title, and difficulty for unattempted problems
SELECT id, title, difficulty
FROM problems
WHERE is_active = TRUE AND id NOT IN (
    SELECT DISTINCT problem_id 
    FROM submissions
)
ORDER BY difficulty, id;

-- Query 5: Advanced query with subquery and multiple joins
-- Find users whose accuracy rate is above the average
-- Expected: Returns username, total attempts, correct attempts, and accuracy percentage
SELECT u.username, 
       COUNT(s.id) AS total_attempts,
       SUM(CASE WHEN s.is_correct THEN 1 ELSE 0 END) AS correct_attempts,
       ROUND(AVG(CASE WHEN s.is_correct THEN 100.0 ELSE 0.0 END), 2) AS accuracy
FROM users u
INNER JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username
HAVING AVG(CASE WHEN s.is_correct THEN 1.0 ELSE 0.0 END) > (
    SELECT AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END)
    FROM submissions
)
ORDER BY accuracy DESC;

-- Query 6: Join with JSON operations
-- Find problems in 'movie' category with their primary concept info
-- Expected: Returns problem title, difficulty, and related concept descriptions
SELECT p.title, p.difficulty, c.name AS concept_name, c.description_zh, c.difficulty_level
FROM problems p
LEFT JOIN concepts c ON p.primary_concept = c.name
WHERE p.interest_tags::jsonb ? 'movie'
ORDER BY p.difficulty;

-- Query 7: Aggregate with ORDER BY and multiple conditions
-- Top 5 most active users by submission count
-- Expected: Returns username, total submissions, and last submission time
SELECT u.username, 
       COUNT(s.id) AS submission_count,
       MAX(s.submitted_at) AS last_submission
FROM users u
INNER JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username
ORDER BY submission_count DESC, last_submission DESC
LIMIT 5;

