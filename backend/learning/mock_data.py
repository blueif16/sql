"""
Mock data for testing without database - 用于无数据库测试的模拟数据
"""

# Mock问题数据（完全按照setup.sql的problems表结构）
MOCK_PROBLEM = {
    "id": 1,
    "title": "查询用户姓名和邮箱",
    "description": "从users表中查询所有用户的姓名(name)和邮箱(email)字段。",
    "difficulty": "easy",
    "primary_concept": "SELECT",
    "secondary_concepts": ["FROM", "Column Selection"],
    "interest_tags": ["基础查询", "用户管理"],
    "sql_schema": '{"table": "users", "columns": [{"name": "id", "type": "INTEGER"}, {"name": "name", "type": "VARCHAR(100)"}, {"name": "email", "type": "VARCHAR(255)"}, {"name": "age", "type": "INTEGER"}], "sample_data": [{"id": 1, "name": "张三", "email": "zhangsan@example.com", "age": 25}, {"id": 2, "name": "李四", "email": "lisi@example.com", "age": 30}, {"id": 3, "name": "王五", "email": "wangwu@example.com", "age": 28}]}',
    "is_active": True
}

# Mock概念数据
MOCK_CONCEPT = {
    "name": "SELECT",
    "explanation": "SELECT语句用于从数据库表中查询数据。基本语法：SELECT 列名 FROM 表名",
    "examples": ["SELECT * FROM users", "SELECT name, email FROM users"]
}

# 期望输出
EXPECTED_OUTPUT = [
    {"name": "张三", "email": "zhangsan@example.com"},
    {"name": "李四", "email": "lisi@example.com"},
    {"name": "王五", "email": "wangwu@example.com"}
]

