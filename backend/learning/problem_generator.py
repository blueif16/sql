"""AI-powered problem generator using Instructor and Pydantic"""

import instructor
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from decouple import config
import logging

logger = logging.getLogger(__name__)  # 日志记录器


class ProblemSchema(BaseModel):
    """Pydantic schema for Problem model - matches Django Problem model"""
    title: str = Field(description="Problem title, concise and descriptive")
    description: str = Field(description="Problem description, clear and specific task requirements")
    difficulty: str = Field(description="Difficulty level: easy, medium, or hard")
    primary_concept: str = Field(description="Primary SQL concept being tested (use uppercase with underscores, e.g., INNER_JOIN, WHERE, GROUP_BY, DISTINCT)")
    secondary_concepts: List[str] = Field(default_factory=list, description="Additional SQL concepts involved as list of strings (use uppercase with underscores)")
    interest_tags: List[str] = Field(default_factory=list, description="Interest tags related to the problem context as list of strings")
    sql_schema: str = Field(
        description="""Complete table schema and sample data in Markdown format. 
        Must include:
        1. Table name as heading (e.g., '### Table: users')
        2. CREATE TABLE statement in code block
        3. Sample data as Markdown table (5-10 rows minimum)
        
        Example format:
        ### Table: users
        ```sql
        CREATE TABLE users (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(255),
            created_at DATE
        );
        ```
        
        **Sample Data:**
        | id | name        | email              | created_at |
        |----|-------------|--------------------|------------|
        | 1  | Alice Smith | alice@example.com  | 2024-10-15 |
        | 2  | Bob Jones   | bob@example.com    | 2024-10-16 |
        | 3  | Carol White | carol@example.com  | 2024-10-17 |
        
        For multiple tables, repeat this format for each table.
        End with '### Expected Result' describing what the query should return."""
    )
    is_active: bool = Field(default=True, description="Whether the problem is active")


class ProblemGenerator:
    """Generate SQL problems using LLM with structured output via Instructor"""
    
    def __init__(self):
        """Initialize the Instructor client with Gemini"""
        self.api_key = config('GOOGLE_API_KEY')
        self.client = instructor.from_provider("google/gemini-2.5-flash-lite", api_key=self.api_key)
    
    def generate_problem(
        self, 
        topic: str, 
        topic_info: str,
        interest_tags: Optional[List[str]] = None,
        difficulty_preference: str = "medium",
        language: str = "en"
    ) -> ProblemSchema:
        """Generate a SQL problem based on topic and user preferences using Instructor
        
        Args:
            topic: SQL concept to focus on (e.g., "INNER JOIN - Combining Tables")
            topic_info: Detailed information about the topic
            interest_tags: User's interest areas (e.g., ["movie", "sports"])
            difficulty_preference: User's preferred difficulty level
            language: Output language ('en' for English, 'zh' for Chinese)
            
        Returns:
            ProblemSchema instance with all required fields
        """
        context_parts = []
        
        if interest_tags:
            context_parts.append(f"User interests: {', '.join(interest_tags)}. Create problem scenarios around these interests.")
        
        context_parts.append(f"Difficulty level should be: {difficulty_preference}.")
        
        context = "\n".join(context_parts) if context_parts else "Create an interesting and practical SQL practice problem."
        
        # Language instruction
        language_instruction = "Please output everything in English." if language == "en" else "请用中文输出所有内容。"
        
        prompt = f"""{language_instruction}

As an experienced SQL teacher, create a practical SQL practice problem.

Topic: {topic}
Topic Description: {topic_info}

User Preferences:
{context}

Requirements:
- Create a realistic and interesting problem
- Use appropriate table structures with proper data types
- Include 5-10 rows of sample data per table
- Format all tables and data in Markdown as specified in the schema
- Make sure the problem can be solved using the {topic} concept"""

        logger.info(f"[ProblemGenerator] 开始生成问题 - Topic: {topic}")
        
        problem = self.client.chat.completions.create(
            response_model=ProblemSchema,
            messages=[{"role": "user", "content": prompt}],
        )
        
        # 日志：生成的问题内容
        logger.info(f"[ProblemGenerator] ✓ 问题标题: {problem.title}")
        logger.info(f"[ProblemGenerator] SQL Schema长度: {len(problem.sql_schema)} 字符")
        logger.info(f"[ProblemGenerator] SQL Schema预览: {problem.sql_schema[:200]}...")
        
        return problem

