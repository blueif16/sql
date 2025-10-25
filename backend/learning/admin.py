"""
Django admin configuration for learning app - Based on schema.sql
"""

from django.contrib import admin
from .models import (
    User, UserRole, Preference, Problem, Submission, UserProgress,
    ChatThread, ChatMessage, Concept, InterestArea
)


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    """Concept admin"""
    list_display = ['name', 'difficulty_level', 'is_active']
    list_filter = ['difficulty_level', 'is_active']
    search_fields = ['name', 'description']
    list_editable = ['is_active']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'description', 'difficulty_level', 'is_active')
        }),
        ('前置知识', {
            'fields': ('prerequisites',)
        }),
    )


@admin.register(InterestArea)
class InterestAreaAdmin(admin.ModelAdmin):
    """Interest area admin"""
    list_display = ['display_name', 'name', 'category', 'icon', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'display_name', 'description']
    list_editable = ['is_active']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'display_name', 'icon', 'category', 'is_active')
        }),
        ('描述', {
            'fields': ('description',)
        }),
    )


@admin.register(User)
class UserAdmin(admin.ModelAdmin):  # 用户管理
    list_display = ['email', 'username', 'language', 'is_active', 'is_staff', 'created_at']
    list_filter = ['is_active', 'is_staff', 'language', 'created_at']
    search_fields = ['email', 'username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'password']
    
    fieldsets = (
        ('基本信息', {'fields': ('email', 'username', 'password')}),
        ('个人信息', {'fields': ('language',)}),
        ('权限', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('时间信息', {'fields': ('created_at',)}),
    )


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """User role admin"""
    list_display = ['user', 'role']
    list_filter = ['role']
    search_fields = ['user__username', 'user__email']
    raw_id_fields = ['user']


@admin.register(Preference)
class PreferenceAdmin(admin.ModelAdmin):
    """User preference admin"""
    list_display = ['user', 'difficulty_preference', 'learning_style', 'ui_theme', 'updated_at']
    list_filter = ['difficulty_preference', 'learning_style', 'ui_theme']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['updated_at']
    raw_id_fields = ['user']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Preferences', {
            'fields': ('difficulty_preference', 'learning_style', 'ui_theme')
        }),
        ('Interests & Progress', {
            'fields': ('interest_areas', 'learned_concepts')
        }),
        ('Metadata', {
            'fields': ('updated_at',)
        }),
    )


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    """Problem admin"""
    list_display = ['id', 'title', 'difficulty', 'primary_concept', 'is_active']
    list_filter = ['difficulty', 'primary_concept', 'is_active']
    search_fields = ['title', 'description', 'primary_concept']
    list_editable = ['is_active']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'difficulty', 'is_active')
        }),
        ('Concepts & Tags', {
            'fields': ('primary_concept', 'secondary_concepts', 'interest_tags')
        }),
        ('SQL Schema', {
            'fields': ('sql_schema',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """Submission admin"""
    list_display = ['id', 'user', 'problem_title', 'is_correct', 'submitted_at']
    list_filter = ['is_correct', 'submitted_at', 'problem__difficulty']
    search_fields = ['user__username', 'problem__title', 'sql_code']
    readonly_fields = ['submitted_at']
    raw_id_fields = ['user', 'problem']
    date_hierarchy = 'submitted_at'
    
    def problem_title(self, obj):
        return obj.problem.title
    problem_title.short_description = 'Problem'
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('user', 'problem', 'is_correct', 'submitted_at')
        }),
        ('SQL Code', {
            'fields': ('sql_code',),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    """User progress admin"""
    list_display = ['user', 'total_solved', 'display_solved_ids']
    search_fields = ['user__username', 'user__email']
    raw_id_fields = ['user']
    
    def total_solved(self, obj):
        return len(obj.solved_problem_ids) if obj.solved_problem_ids else 0
    total_solved.short_description = 'Total Solved'
    
    def display_solved_ids(self, obj):
        if not obj.solved_problem_ids:
            return 'None'
        ids = sorted(obj.solved_problem_ids)[:10]
        display = ', '.join(map(str, ids))
        if len(obj.solved_problem_ids) > 10:
            display += f' ... (+{len(obj.solved_problem_ids) - 10} more)'
        return display
    display_solved_ids.short_description = 'Solved Problem IDs'


@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    """Chat thread admin"""
    list_display = ['thread_id', 'user', 'problem', 'language', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'language', 'created_at']
    search_fields = ['thread_id', 'user__username']
    raw_id_fields = ['user', 'problem']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Chat message admin"""
    list_display = ['id', 'thread', 'message_type', 'content_preview', 'created_at']
    list_filter = ['message_type', 'created_at']
    search_fields = ['content', 'thread__thread_id']
    raw_id_fields = ['thread']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
