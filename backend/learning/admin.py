"""
Admin configuration for the learning app.
"""

from django.contrib import admin
from .models import Theme, Section, Concept, Problem, UserProgress, QuerySubmission


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'display_name']
    ordering = ['name']


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'theme', 'order', 'is_active', 'created_at']
    list_filter = ['theme', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['theme', 'order']


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ['name', 'section', 'order', 'is_active', 'created_at']
    list_filter = ['section__theme', 'section', 'is_active', 'created_at']
    search_fields = ['name', 'explanation']
    ordering = ['section', 'order']


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ['concept', 'order', 'table_name', 'is_active', 'created_at']
    list_filter = ['concept__section__theme', 'concept__section', 'concept', 'is_active', 'created_at']
    search_fields = ['task', 'query', 'table_name']
    ordering = ['concept', 'order']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'problem', 'completed', 'attempts', 'completed_at']
    list_filter = ['completed', 'created_at', 'completed_at']
    search_fields = ['user__username', 'problem__concept__name']
    ordering = ['-updated_at']


@admin.register(QuerySubmission)
class QuerySubmissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'problem', 'is_correct', 'submitted_at']
    list_filter = ['is_correct', 'submitted_at']
    search_fields = ['user__username', 'problem__concept__name', 'query']
    ordering = ['-submitted_at']
    readonly_fields = ['submitted_at']
