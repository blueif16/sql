"""AI-powered problem generator using Google Gemini and Pydantic"""

import google.generativeai as genai
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from decouple import config
import json
import logging

logger = logging.getLogger(__name__)  # 日志记录器


class ProblemSchema(BaseModel):
    """Pydantic schema for Problem model - matches Django Problem model"""
    title: str = Field(description="Problem title, concise and descriptive")
    description: str = Field(description="Problem description, clear and specific task requirements")
    difficulty: str = Field(description="Difficulty level: easy, medium, or hard")
    primary_concept: str = Field(
        description="Primary SQL concept being tested (use uppercase with underscores, "
        "e.g., INNER_JOIN, WHERE, GROUP_BY, DISTINCT)")
    secondary_concepts: List[str] = Field(
        default_factory=list,
        description="Additional SQL concepts involved as list of strings "
        "(use uppercase with underscores)")
    interest_tags: List[str] = Field(
        default_factory=list,
        description="Interest tags related to the problem context as list of strings")
    sql_schema: str = Field(
        description="""Complete sql source code for the problem that can be executed directly to create sql table"""
    )
    is_active: bool = Field(default=True, description="Whether the problem is active")


class SolutionEvaluationSchema(BaseModel):
    """Pydantic schema for SQL solution evaluation"""
    is_correct: bool = Field(description="Whether the SQL solution is correct (true) or wrong (false)")
    explanation: str = Field(description="Detailed explanation of why the solution is correct or incorrect, including what the query should return and why it fails/succeeds")


class ProblemGenerator:
    """Generate SQL problems using Google Gemini with structured output"""

    def __init__(self):
        """Initialize the Google Gemini client"""
        self.api_key = config('GOOGLE_API_KEY')
        genai.configure(api_key=self.api_key)
        self.model_name = config('GEMINI_MODEL', default='gemini-2.5-flash')
        self.model = genai.GenerativeModel(self.model_name)

    def generate_problem(
        self,
        topic: str,
        topic_info: str,
        interest_tags: Optional[List[str]] = None,
        difficulty_preference: str = "medium",
        language: str = "en"
    ) -> ProblemSchema:
        """Generate a SQL problem based on topic and user preferences using Google Gemini

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
            context_parts.append(
                f"User interests: {', '.join(interest_tags)}. "
                "Create problem scenarios around these interests.")

        context_parts.append(f"Difficulty level should be: {difficulty_preference}.")

        context = "\n".join(context_parts) if context_parts else \
            "Create an interesting and practical SQL practice problem."

        # Language instruction
        language_instruction = "Please output everything in English." if language == "en" \
            else "请用中文输出所有内容。"

        prompt = f"""{language_instruction}

As an experienced SQL teacher, create a practical SQL practice problem.

Topic: {topic}
Topic Description: {topic_info}

User Preferences:
{context}

Requirements:
- Create a realistic and interesting problem, be creative
- Include 5-10 rows of sample data per table
- Format all tables and data in sql source code as specified in the schema
- Make sure the problem can be solved using the {topic} concept"""

        logger.info(f"[ProblemGenerator] 开始生成问题 - Topic: {topic}")

        # Add JSON format instruction for structured output
        json_instruction = """
Return your response as a valid JSON object that matches this schema:
{
    "title": "string",
    "description": "string",
    "difficulty": "easy|medium|hard",
    "primary_concept": "UPPERCASE_WITH_UNDERSCORES",
    "secondary_concepts": ["string"],
    "interest_tags": ["string"],
    "sql_schema": "string",
    "is_active": true
}
"""

        full_prompt = f"{prompt}\n\n{json_instruction}"

        # Configure model for JSON response
        generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            response_mime_type="application/json"
        )

        response = self.model.generate_content(
            full_prompt,
            generation_config=generation_config
        )

        # Parse JSON response
        try:
            response_data = json.loads(response.text)
            problem = ProblemSchema(**response_data)
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"[ProblemGenerator] JSON parse failed: {e}")
            logger.error(f"[ProblemGenerator] Original response: {response.text}")
            raise ValueError(f"Failed to parse Gemini response as JSON: {e}")

        # 日志：生成的问题内容
        logger.info(f"[ProblemGenerator] ✓ Problem title: {problem.title}")
        logger.info(f"[ProblemGenerator] SQL Schema length: {len(problem.sql_schema)} characters")
        logger.info(f"[ProblemGenerator] SQL Schema preview: "
                   f"{problem.sql_schema}")

        return problem

    def evaluate_solution(
        self,
        problem_description: str,
        problem_schema: str,
        user_solution: str,
        language: str = "en"
    ) -> SolutionEvaluationSchema:
        """Evaluate a user's SQL solution against the expected result

        Args:
            problem_description: The problem description/task
            problem_schema: SQL schema/DDL for the problem
            user_solution: User's SQL query solution
            language: Output language ('en' for English, 'zh' for Chinese)

        Returns:
            SolutionEvaluationSchema with is_correct and explanation
        """
        # Language instruction
        language_instruction = "Please output everything in English." if language == "en" \
            else "请用中文输出所有内容。"

        prompt = f"""{language_instruction}

As an experienced SQL teacher and database expert, evaluate if this SQL solution correctly solves the given problem.

PROBLEM:
{problem_description}

DATABASE SCHEMA:
{problem_schema}

USER'S SQL SOLUTION:
{user_solution}

EVALUATION REQUIREMENTS:
- Check if the SQL query is syntactically correct
- Verify if the query produces the expected results for the given problem
- Consider if there are any logical errors or missing requirements
- Check for potential performance issues or inefficient approaches
- Ensure the query follows SQL best practices

Return your evaluation as either CORRECT or INCORRECT, plus a detailed explanation."""

        logger.info(f"[ProblemGenerator] 开始评估SQL解法 - Solution length: {len(user_solution)}")

        # Configure model for JSON response
        generation_config = genai.types.GenerationConfig(
            temperature=0.3,  # Lower temperature for more consistent evaluation
            response_mime_type="application/json"
        )

        # Create evaluation prompt
        evaluation_prompt = f"""{language_instruction}

As an experienced SQL teacher and database expert, evaluate if this SQL solution correctly solves the given problem.

Return your evaluation as a JSON object with exactly this structure:
{{
    "is_correct": true/false,
    "explanation": "detailed explanation of why the solution is correct or incorrect"
}}

PROBLEM:
{problem_description}

DATABASE SCHEMA:
{problem_schema}

USER'S SQL SOLUTION:
{user_solution}

EVALUATION CRITERIA:
- Check if the SQL query is syntactically correct
- Verify if the query produces the expected results for the given problem
- Consider if there are any logical errors or missing requirements
- Check for potential performance issues or inefficient approaches
- Ensure the query follows SQL best practices
- Be precise and detailed in your explanation"""

        try:
            response = self.model.generate_content(
                evaluation_prompt,
                generation_config=generation_config
            )

            # Parse JSON response
            response_data = json.loads(response.text)
            evaluation = SolutionEvaluationSchema(**response_data)

            logger.info(f"[ProblemGenerator] ✓ 解法评估完成 - Correct: {evaluation.is_correct}")
            return evaluation

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"[ProblemGenerator] JSON parse failed: {e}")
            logger.error(f"[ProblemGenerator] Original response: {response.text if 'response' in locals() else 'No response'}")
            # Fallback response
            return SolutionEvaluationSchema(
                is_correct=False,
                explanation="Failed to evaluate solution due to technical error. Please try again."
            )
        except Exception as e:
            logger.error(f"[ProblemGenerator] 解法评估失败: {e}")
            # Fallback response
            return SolutionEvaluationSchema(
                is_correct=False,
                explanation="Failed to evaluate solution due to technical error. Please try again."
            )