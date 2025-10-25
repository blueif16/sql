"""
Serializers for the SQL Learning Platform API - Based on schema.sql
"""

from rest_framework import serializers
from .models import (
    User, UserRole, Preference, Problem, Submission, UserProgress,
    ChatThread, ChatMessage, Concept, InterestArea
)


class UserSerializer(serializers.ModelSerializer):  # 用户序列化器
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'language', 'created_at']
        read_only_fields = ['created_at']


class ConceptSerializer(serializers.ModelSerializer):
    """Concept serializer"""
    localized_name = serializers.SerializerMethodField()  # 根据用户语言返回名称
    localized_description = serializers.SerializerMethodField()  # 根据用户语言返回描述
    
    class Meta:
        model = Concept
        fields = ['id', 'name', 'localized_name', 'description', 'localized_description', 'difficulty_level', 'prerequisites', 'is_active', 'name_zh', 'name_en', 'description_zh', 'description_en']
    
    def get_localized_name(self, obj):
        """根据用户语言返回本地化名称"""
        request = self.context.get('request')
        language = 'en' # 默认英文
        if request:
            if hasattr(request, 'user') and request.user.is_authenticated: # 优先从已登录用户获取语言
                language = request.user.language
            else: # 未登录用户从请求头或查询参数获取语言
                language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en')
                if language.startswith('zh'):
                    language = 'zh'
                else:
                    language = 'en'
        if language == 'zh' and obj.name_zh:
            return obj.name_zh
        elif language == 'en' and obj.name_en:
            return obj.name_en
        return obj.name
    
    def get_localized_description(self, obj):
        """根据用户语言返回本地化描述"""
        request = self.context.get('request')
        language = 'en' # 默认英文
        if request:
            if hasattr(request, 'user') and request.user.is_authenticated: # 优先从已登录用户获取语言
                language = request.user.language
            else: # 未登录用户从请求头或查询参数获取语言
                language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en')
                if language.startswith('zh'):
                    language = 'zh'
                else:
                    language = 'en'
        if language == 'zh' and obj.description_zh:
            return obj.description_zh
        elif language == 'en' and obj.description_en:
            return obj.description_en
        return obj.description


class InterestAreaSerializer(serializers.ModelSerializer):
    """Interest area serializer"""
    localized_display_name = serializers.SerializerMethodField()  # 根据用户语言返回显示名称
    localized_description = serializers.SerializerMethodField()  # 根据用户语言返回描述
    
    class Meta:
        model = InterestArea
        fields = ['id', 'name', 'display_name', 'localized_display_name', 'description', 'localized_description', 'icon', 'category', 'is_active', 'display_name_zh', 'display_name_en', 'description_zh', 'description_en']
    
    def get_localized_display_name(self, obj):
        """根据用户语言返回本地化显示名称"""
        request = self.context.get('request')
        language = 'en' # 默认英文
        if request:
            if hasattr(request, 'user') and request.user.is_authenticated: # 优先从已登录用户获取语言
                language = request.user.language
            else: # 未登录用户从请求头或查询参数获取语言
                language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en')
                if language.startswith('zh'):
                    language = 'zh'
                else:
                    language = 'en'
        if language == 'zh' and obj.display_name_zh:
            return obj.display_name_zh
        elif language == 'en' and obj.display_name_en:
            return obj.display_name_en
        return obj.display_name
    
    def get_localized_description(self, obj):
        """根据用户语言返回本地化描述"""
        request = self.context.get('request')
        language = 'en' # 默认英文
        if request:
            if hasattr(request, 'user') and request.user.is_authenticated: # 优先从已登录用户获取语言
                language = request.user.language
            else: # 未登录用户从请求头或查询参数获取语言
                language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en')
                if language.startswith('zh'):
                    language = 'zh'
                else:
                    language = 'en'
        if language == 'zh' and obj.description_zh:
            return obj.description_zh
        elif language == 'en' and obj.description_en:
            return obj.description_en
        return obj.description


class UserRoleSerializer(serializers.ModelSerializer):
    """User role serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'user', 'username', 'role']


class PreferenceSerializer(serializers.ModelSerializer):
    """User preference serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Preference
        fields = [
            'id', 'user', 'username',
            'difficulty_preference', 'learning_style',
            'interest_areas', 'learned_concepts',
            'ui_theme', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'username', 'updated_at']


class ProblemListSerializer(serializers.ModelSerializer):
    """Lightweight problem serializer for list views"""
    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'difficulty',
            'primary_concept', 'secondary_concepts', 'interest_tags', 
            'sql_schema', 'is_active'  # 添加sql_schema以支持前端渲染
        ]


class ProblemSerializer(serializers.ModelSerializer):
    """Full problem serializer with all details"""
    concept_info = serializers.SerializerMethodField()  # Include concept details
    
    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'difficulty',
            'primary_concept', 'secondary_concepts',
            'interest_tags', 'sql_schema', 'is_active',
            'concept_info'
        ]
    
    def get_concept_info(self, obj):
        """Automatically fetch concept info for the problem"""
        try:
            concept = Concept.objects.get(name=obj.primary_concept, is_active=True)
            request = self.context.get('request')
            language = 'en' # 默认英文
            if request:
                if hasattr(request, 'user') and request.user.is_authenticated: # 优先从已登录用户获取语言
                    language = request.user.language
                else: # 未登录用户从请求头或查询参数获取语言
                    language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en')
                    if language.startswith('zh'):
                        language = 'zh'
                    else:
                        language = 'en'
            
            # 根据语言选择名称和描述
            localized_name = concept.name_zh if language == 'zh' and concept.name_zh else (concept.name_en if language == 'en' and concept.name_en else concept.name)
            localized_description = concept.description_zh if language == 'zh' and concept.description_zh else (concept.description_en if language == 'en' and concept.description_en else concept.description)
            
            return {
                'name': concept.name,
                'localized_name': localized_name,
                'description': concept.description,
                'localized_description': localized_description,
                'difficulty_level': concept.difficulty_level,
                'prerequisites': concept.prerequisites
            }
        except Concept.DoesNotExist:
            return None


class SubmissionSerializer(serializers.ModelSerializer):
    """Submission serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    problem_difficulty = serializers.CharField(source='problem.difficulty', read_only=True)
    
    class Meta:
        model = Submission
        fields = [
            'id', 'user', 'username',
            'problem', 'problem_title', 'problem_difficulty',
            'sql_code', 'is_correct', 'submitted_at'
        ]
        read_only_fields = ['id', 'user', 'username', 'submitted_at']


class UserProgressSerializer(serializers.ModelSerializer):
    """User progress serializer"""
    username = serializers.CharField(source='user.username', read_only=True)
    total_solved = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'username',
            'solved_problem_ids', 'total_solved'
        ]
        read_only_fields = ['id', 'user', 'username']
    
    def get_total_solved(self, obj):
        """Calculate total solved problems"""
        return len(obj.solved_problem_ids) if obj.solved_problem_ids else 0


class ChatMessageSerializer(serializers.ModelSerializer):
    """Chat message serializer"""
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatThreadSerializer(serializers.ModelSerializer):
    """Chat thread serializer"""
    messages = ChatMessageSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    
    class Meta:
        model = ChatThread
        fields = [
            'id', 'thread_id', 'user', 'username',
            'problem', 'problem_title',
            'language', 'is_active', 'messages',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatRequestSerializer(serializers.Serializer):
    """Chat request serializer"""
    message = serializers.CharField(required=True)
    thread_id = serializers.CharField(required=False, allow_blank=True, allow_null=True) # 允许null值
    problem_id = serializers.IntegerField(required=False, allow_null=True)
    language = serializers.CharField(default='zh', max_length=20)
