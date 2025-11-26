"""
Models for the SQL Learning Platform - 基于 schema.sql
"""

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):  # 用户管理器
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('必须提供邮箱地址')
        if not username:
            raise ValueError('必须提供用户名')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        user = self.create_user(email, username, password, **extra_fields)
        return user


class User(AbstractBaseUser):  # 用户基础表
    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('zh', 'Chinese'),
    )
    
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=100, unique=True, db_index=True)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Django admin 所需字段
    is_staff = models.BooleanField(default=False)  # 是否可以访问 admin 站点
    is_superuser = models.BooleanField(default=False)  # 是否拥有所有权限
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'  # 使用邮箱作为登录字段
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):  # Django admin 权限检查
        return self.is_superuser
    
    def has_module_perms(self, app_label):  # Django admin 模块权限检查
        return self.is_superuser
    
    class Meta:
        db_table = 'users'


@receiver(post_save, sender=User)
def create_default_user_role(sender, instance, created, **kwargs):  # 创建用户时自动分配默认角色
    if created:
        UserRole.objects.create(user=instance, role='user')


class UserRole(models.Model):
    """User roles table"""
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
        ('premium_user', 'Premium User'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
    class Meta:
        db_table = 'user_roles'


class Concept(models.Model):
    """SQL Concepts - 预定义的SQL概念库"""
    name = models.CharField(max_length=100, unique=True, db_index=True)  # "INNER_JOIN"
    name_zh = models.CharField(max_length=100, blank=True)  # 中文名称
    name_en = models.CharField(max_length=100, blank=True)  # 英文名称
    description = models.TextField()  # 详细说明，用于生成prompt
    description_zh = models.TextField(blank=True)  # 中文描述
    description_en = models.TextField(blank=True)  # 英文描述
    difficulty_level = models.CharField(max_length=20, default='intermediate')  # "beginner", "intermediate", "advanced"
    prerequisites = models.JSONField(default=list, blank=True)  # ["SELECT", "WHERE"]
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'concepts'


class InterestArea(models.Model):
    """Interest Areas - 用户感兴趣的数据场景/主题"""
    name = models.CharField(max_length=100, unique=True, db_index=True)  # "movie", "football", "ecommerce"
    display_name = models.CharField(max_length=100)  # "电影娱乐", "足球运动", "电商购物"
    display_name_zh = models.CharField(max_length=100, blank=True)  # 中文显示名称
    display_name_en = models.CharField(max_length=100, blank=True)  # 英文显示名称
    description = models.TextField(blank=True)  # 详细说明
    description_zh = models.TextField(blank=True)  # 中文描述
    description_en = models.TextField(blank=True)  # 英文描述
    icon = models.CharField(max_length=50, blank=True)  # emoji 或图标
    category = models.CharField(max_length=50, default='general')  # "entertainment", "sports", "business"
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.display_name
    
    class Meta:
        db_table = 'interest_areas'


class Preference(models.Model):
    """User preferences - centralized configuration management"""
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    
    LEARNING_STYLE_CHOICES = (
        ('guided', 'Guided'),
        ('challenge', 'Challenge'),
        ('step_by_step', 'Step by Step'),
    )
    
    UI_THEME_CHOICES = (
        ('dark', 'Dark'),
        ('light', 'Light'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preference')
    difficulty_preference = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='easy')
    learning_style = models.CharField(max_length=20, choices=LEARNING_STYLE_CHOICES, default='guided')
    interest_areas = models.JSONField(default=list, blank=True)  # ["movie","football","ecommerce"]
    learned_concepts = models.JSONField(default=list, blank=True)  # ["JOINS","GROUP_BY"]
    ui_theme = models.CharField(max_length=10, choices=UI_THEME_CHOICES, default='light')
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} preferences"
    
    class Meta:
        db_table = 'preferences'


class Problem(models.Model):
    """Problems table - independent SQL exercises"""
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    primary_concept = models.CharField(max_length=50)
    secondary_concepts = models.JSONField(default=list, blank=True)  # ["SUBQUERIES","ORDER_BY"]
    interest_tags = models.JSONField(default=list, blank=True)  # ["movie","entertainment"]
    sql_schema = models.TextField()  # sql source code for the problem that can be executed directly
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} ({self.difficulty})"
    
    class Meta:
        db_table = 'problems'
        indexes = [
            models.Index(fields=['difficulty']),
            models.Index(fields=['primary_concept']),
            models.Index(fields=['is_active']),
        ]


class Submission(models.Model):
    """Submissions table - user SQL submissions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    sql_code = models.TextField()
    is_correct = models.BooleanField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {'correct' if self.is_correct else 'incorrect'}"
    
    class Meta:
        db_table = 'submissions'
        indexes = [
            models.Index(fields=['user', 'problem']),
            models.Index(fields=['user', 'submitted_at']),
        ]
        ordering = ['-submitted_at']


class UserProgress(models.Model):
    """User progress table - solved problems tracking"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    solved_problem_ids = models.JSONField(default=list, blank=True)  # [1,5,12,25]
    
    def __str__(self):
        return f"{self.user.username} - {len(self.solved_problem_ids)} solved"
    
    class Meta:
        db_table = 'user_progress'


class ChatThread(models.Model):
    """Chat thread - conversation tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_threads', null=True, blank=True)
    thread_id = models.CharField(max_length=100, unique=True, db_index=True)
    problem = models.ForeignKey(Problem, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_threads')
    language = models.CharField(max_length=20, default='zh')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Thread {self.thread_id} - {self.user.username if self.user else 'Anonymous'}"
    
    class Meta:
        ordering = ['-updated_at']


class ChatMessage(models.Model):
    """Chat message - individual message in conversation"""
    MESSAGE_TYPES = (
        ('human', 'Human'),
        ('ai', 'AI'),
        ('system', 'System'),
    )
    
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.message_type} - {self.content[:50]}"
    
    class Meta:
        ordering = ['created_at']
