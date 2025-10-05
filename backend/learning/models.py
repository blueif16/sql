"""
Models for the SQL Learning Platform.
"""

from django.db import models
from django.contrib.auth.models import User


class Theme(models.Model):
    """Theme for SQL learning exercises."""
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.display_name

    class Meta:
        ordering = ['name']


class Section(models.Model):
    """Learning sections containing concepts."""
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.theme.display_name} - {self.title}"

    class Meta:
        ordering = ['theme', 'order']


class Concept(models.Model):
    """SQL concepts within sections."""
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='concepts')
    name = models.CharField(max_length=100)
    explanation = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.section.title} - {self.name}"

    class Meta:
        ordering = ['section', 'order']


class Problem(models.Model):
    """SQL problems within concepts."""
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='problems')
    task = models.TextField()
    query = models.TextField()
    expected_output = models.JSONField()
    table_data = models.JSONField()
    table_name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.concept.name} - Problem {self.order}"

    class Meta:
        ordering = ['concept', 'order']


class UserProgress(models.Model):
    """Track user progress through the learning platform."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='user_progress')
    completed = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    first_attempt_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.problem}"

    class Meta:
        unique_together = ['user', 'problem']


class QuerySubmission(models.Model):
    """Store user query submissions for analysis."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    query = models.TextField()
    is_correct = models.BooleanField()
    user_output = models.JSONField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.problem} - {self.submitted_at}"

    class Meta:
        ordering = ['-submitted_at']
