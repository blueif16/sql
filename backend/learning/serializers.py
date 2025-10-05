"""
Serializers for the SQL Learning Platform API.
"""

from rest_framework import serializers
from .models import Theme, Section, Concept, Problem, UserProgress, QuerySubmission


class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = ['id', 'name', 'display_name', 'description', 'is_active']


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'is_active']


class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ['id', 'name', 'explanation', 'order', 'is_active']


class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = ['id', 'task', 'query', 'expected_output', 'table_data', 'table_name', 'order', 'is_active']


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['id', 'completed', 'attempts', 'first_attempt_at', 'completed_at']


class QuerySubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuerySubmission
        fields = ['id', 'query', 'is_correct', 'user_output', 'submitted_at']


class DetailedSectionSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'is_active', 'concepts']


class DetailedConceptSerializer(serializers.ModelSerializer):
    problems = ProblemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Concept
        fields = ['id', 'name', 'explanation', 'order', 'is_active', 'problems']


class DetailedThemeSerializer(serializers.ModelSerializer):
    sections = DetailedSectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Theme
        fields = ['id', 'name', 'display_name', 'description', 'is_active', 'sections']
