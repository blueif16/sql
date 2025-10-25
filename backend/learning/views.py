"""
Views for the SQL Learning Platform API - Based on schema.sql
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db.models import Q, Count
from django.http import StreamingHttpResponse
from django.contrib.auth import login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
import json
import logging  # 日志模块

from .models import (
    User, UserRole, Preference, Problem, Submission, UserProgress,
    ChatThread, ChatMessage, Concept, InterestArea
)
from .serializers import (
    UserRoleSerializer, PreferenceSerializer,
    ProblemSerializer, ProblemListSerializer,
    SubmissionSerializer, UserProgressSerializer,
    ChatThreadSerializer, ChatMessageSerializer, ChatRequestSerializer,
    ConceptSerializer, InterestAreaSerializer, UserSerializer
)
from .chatbot import SQLChatbot
from .problem_generator import ProblemGenerator

logger = logging.getLogger(__name__)  # 初始化日志记录器


@api_view(['POST'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def auto_login(request):
    """自动登录默认用户"""
    try:
        # 获取或创建默认用户
        user, created = User.objects.get_or_create(
            email='guest@example.com',
            defaults={
                'username': 'guest_user',
                'language': 'en'
            }
        )
        
        # 如果用户已存在但语言未设置，更新为英文
        if not created and not user.language:
            user.language = 'en'
            user.save()
        
        # 登录用户
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        # 返回用户信息
        serializer = UserSerializer(user)
        response = Response({
            'user': serializer.data,
            'message': '自动登录成功'
        })
        
        # 确保CSRF cookie被设置
        response['X-CSRFToken'] = request.META.get('CSRF_COOKIE', '')
        return response
    except Exception as e:
        return Response({
            'error': f'自动登录失败: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_language(request):
    """更新用户语言设置"""
    try:
        language = request.data.get('language')
        if not language:
            return Response({'error': 'language field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if language not in ['en', 'zh']:
            return Response({'error': 'Invalid language. Must be "en" or "zh"'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        user.language = language
        user.save()
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'message': 'Language updated successfully',
            'user': serializer.data
        })
    except Exception as e:
        return Response({'error': f'Failed to update language: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConceptViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for SQL concepts"""
    queryset = Concept.objects.filter(is_active=True)
    serializer_class = ConceptSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def with_progress(self, request):
        """Get all concepts grouped by difficulty with user progress"""
        concepts = Concept.objects.filter(is_active=True).order_by('name')
        
        # Get user language
        user_language = 'zh'  # 默认中文
        if request.user.is_authenticated:
            user_language = request.user.language
        
        # Get user's solved problems if authenticated
        user_concept_stats = {}
        if request.user.is_authenticated:
            try:
                progress = UserProgress.objects.get(user=request.user)
                if progress.solved_problem_ids:
                    # Get all solved problems
                    solved_problems = Problem.objects.filter(id__in=progress.solved_problem_ids)
                    
                    # Count problems solved per concept
                    for problem in solved_problems:
                        # Count primary concept
                        if problem.primary_concept not in user_concept_stats:
                            user_concept_stats[problem.primary_concept] = {'solved': 0, 'total': 0}
                        user_concept_stats[problem.primary_concept]['solved'] += 1
                        
                        # Count secondary concepts
                        if problem.secondary_concepts:
                            for concept in problem.secondary_concepts:
                                if concept not in user_concept_stats:
                                    user_concept_stats[concept] = {'solved': 0, 'total': 0}
                                user_concept_stats[concept]['solved'] += 1
            except UserProgress.DoesNotExist:
                pass
        
        # Count total problems per concept
        all_problems = Problem.objects.filter(is_active=True)
        for problem in all_problems:
            if problem.primary_concept not in user_concept_stats:
                user_concept_stats[problem.primary_concept] = {'solved': 0, 'total': 0}
            user_concept_stats[problem.primary_concept]['total'] += 1
            
            if problem.secondary_concepts:
                for concept in problem.secondary_concepts:
                    if concept not in user_concept_stats:
                        user_concept_stats[concept] = {'solved': 0, 'total': 0}
                    user_concept_stats[concept]['total'] += 1
        
        # Group concepts by difficulty
        result = {
            'beginner': [],
            'intermediate': [],
            'advanced': []
        }
        
        for concept in concepts:
            stats = user_concept_stats.get(concept.name, {'solved': 0, 'total': 0})
            # 根据用户语言返回本地化字段
            localized_name = concept.name
            localized_description = concept.description
            if user_language == 'zh':
                localized_name = concept.name_zh if concept.name_zh else concept.name
                localized_description = concept.description_zh if concept.description_zh else concept.description
            elif user_language == 'en':
                localized_name = concept.name_en if concept.name_en else concept.name
                localized_description = concept.description_en if concept.description_en else concept.description
            
            concept_data = {
                'id': concept.id,
                'name': concept.name,  # 保持原始name用于API调用
                'localized_name': localized_name,  # 添加localized_name用于显示
                'description': concept.description,  # 保持原始description
                'localized_description': localized_description,  # 添加localized_description用于显示
                'difficulty_level': concept.difficulty_level,
                'prerequisites': concept.prerequisites,
                'solved': stats['solved'],
                'total': stats['total'],
                'progress_percentage': (stats['solved'] / stats['total'] * 100) if stats['total'] > 0 else 0
            }
            result[concept.difficulty_level].append(concept_data)
        
        return Response(result)


class InterestAreaViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for interest areas"""
    queryset = InterestArea.objects.filter(is_active=True)
    serializer_class = InterestAreaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filter by category if specified"""
        queryset = InterestArea.objects.filter(is_active=True).order_by('category', 'name')
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class UserRoleViewSet(viewsets.ModelViewSet):
    """ViewSet for user roles - Admin only"""
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Filter by user if specified"""
        queryset = UserRole.objects.all()
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset


class PreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for user preferences"""
    queryset = Preference.objects.all()
    serializer_class = PreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only access their own preferences"""
        return Preference.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user's preferences"""
        preference, created = Preference.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(preference, data=request.data, partial=partial)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for problems"""
    queryset = Problem.objects.filter(is_active=True)
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'primary_concept']
    ordering_fields = ['id', 'difficulty', 'title']
    ordering = ['id']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list, full serializer for detail"""
        if self.action == 'list':
            return ProblemListSerializer
        return ProblemSerializer
    
    def get_queryset(self):
        """Filter problems by difficulty, concept, tags"""
        queryset = Problem.objects.filter(is_active=True)
        
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        primary_concept = self.request.query_params.get('primary_concept', None)
        if primary_concept:
            queryset = queryset.filter(primary_concept=primary_concept)
        
        interest_tag = self.request.query_params.get('interest_tag', None)
        if interest_tag:
            queryset = queryset.filter(interest_tags__contains=[interest_tag])
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """重写list方法以添加日志记录"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        # 日志记录：查询到的问题
        if page is not None:
            for problem in page:
                logger.info(f"[ProblemViewSet] 问题ID: {problem.id}, 标题: {problem.title}")
                logger.info(f"[ProblemViewSet] SQL Schema类型: {type(problem.sql_schema)}")
                logger.info(f"[ProblemViewSet] SQL Schema内容: {problem.sql_schema}")
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            # 日志记录：序列化后的数据
            for item in serializer.data:
                logger.info(f"[ProblemViewSet] 序列化后的问题: {item.get('title')}")
                logger.info(f"[ProblemViewSet] 序列化后的SQL Schema: {item.get('sql_schema')}")
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        # 日志记录：序列化后的数据（无分页）
        for item in serializer.data:
            logger.info(f"[ProblemViewSet] 序列化后的问题: {item.get('title')}")
            logger.info(f"[ProblemViewSet] 序列化后的SQL Schema: {item.get('sql_schema')}")
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit(self, request, pk=None):
        """Submit SQL solution for a problem"""
        problem = self.get_object()
        sql_code = request.data.get('sql_code', '').strip()
        
        if not sql_code:
            return Response(
                {'error': 'sql_code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Execute query and validate result
        # For now, simple validation
        is_correct = 'select' in sql_code.lower()
        
        # Create submission
        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            sql_code=sql_code,
            is_correct=is_correct
        )
        
        # Update progress if correct
        if is_correct:
            progress, created = UserProgress.objects.get_or_create(user=request.user)
            if problem.id not in progress.solved_problem_ids:
                progress.solved_problem_ids.append(problem.id)
                progress.save()
        
        return Response({
            'submission_id': submission.id,
            'is_correct': is_correct,
            'message': 'Correct!' if is_correct else 'Incorrect, please try again.'
        })
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def progress(self, request, pk=None):
        """Get user's progress for this problem"""
        problem = self.get_object()
        
        try:
            user_progress = UserProgress.objects.get(user=request.user)
            is_solved = problem.id in user_progress.solved_problem_ids
        except UserProgress.DoesNotExist:
            is_solved = False
        
        # Get submission count
        submission_count = Submission.objects.filter(
            user=request.user,
            problem=problem
        ).count()
        
        return Response({
            'problem_id': problem.id,
            'is_solved': is_solved,
            'attempts': submission_count
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def generate(self, request):
        """Generate a new problem based on user's topic selection and preferences"""
        topic = request.data.get('topic')
        
        # 日志：接收到的topic
        logger.info(f"[ProblemViewSet.generate] 接收到的topic: '{topic}'")
        logger.info(f"[ProblemViewSet.generate] 请求数据: {request.data}")
        
        if not topic:
            return Response({'error': 'topic is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 日志：查询所有可用的概念名称
        available_concepts = list(Concept.objects.filter(is_active=True).values_list('name', flat=True))
        logger.info(f"[ProblemViewSet.generate] 数据库中可用的概念: {available_concepts}")
        
        try:
            concept = Concept.objects.get(name=topic, is_active=True)
        except Concept.DoesNotExist:
            logger.error(f"[ProblemViewSet.generate] 概念未找到: '{topic}'")
            return Response({'error': f'Concept "{topic}" not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            preference, _ = Preference.objects.get_or_create(user=request.user)
            
            # 获取用户语言设置
            user_language = request.user.language if request.user.language else 'en'
            
            # 根据用户语言选择对应的概念描述
            topic_info = concept.description
            if user_language == 'zh' and concept.description_zh:
                topic_info = concept.description_zh
            elif user_language == 'en' and concept.description_en:
                topic_info = concept.description_en
            
            generator = ProblemGenerator()
            generated_problem = generator.generate_problem(
                topic=topic,
                topic_info=topic_info,
                interest_tags=preference.interest_areas,
                difficulty_preference=preference.difficulty_preference,
                language=user_language
            )
            
            # 日志：生成的问题数据
            logger.info(f"[ProblemViewSet.generate] 生成的问题类型: {type(generated_problem)}")
            problem_dict = generated_problem.model_dump()
            logger.info(f"[ProblemViewSet.generate] model_dump完成")
            logger.info(f"[ProblemViewSet.generate] 字段列表: {list(problem_dict.keys())}")
            
            sql_schema = problem_dict.get('sql_schema')
            logger.info(f"[ProblemViewSet.generate] sql_schema类型: {type(sql_schema)}")
            logger.info(f"[ProblemViewSet.generate] sql_schema长度: {len(sql_schema) if isinstance(sql_schema, str) else 'N/A'} 字符")
            logger.info(f"[ProblemViewSet.generate] sql_schema预览: {sql_schema[:300] if isinstance(sql_schema, str) else sql_schema}...")
            
            problem = Problem.objects.create(**problem_dict)
            
            # 日志：保存后的数据
            logger.info(f"[ProblemViewSet.generate] ✓ 问题已保存, ID: {problem.id}")
            logger.info(f"[ProblemViewSet.generate] sql_schema已保存: {len(str(problem.sql_schema))} 字符")
            
            serializer = ProblemSerializer(problem)
            success_message = 'Problem generated successfully' if user_language == 'en' else '问题生成成功'
            return Response({
                'success': True,
                'message': success_message,
                'problem': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"[ProblemViewSet.generate] ❌ 生成问题失败: {str(e)}")
            logger.error(f"[ProblemViewSet.generate] 错误类型: {type(e).__name__}")
            import traceback
            logger.error(f"[ProblemViewSet.generate] 堆栈跟踪:\n{traceback.format_exc()}")
            return Response({'error': f'Failed to generate problem: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for submissions"""
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['submitted_at', 'is_correct']
    ordering = ['-submitted_at']
    
    def get_queryset(self):
        """Users can only access their own submissions"""
        queryset = Submission.objects.filter(user=self.request.user)
        
        problem_id = self.request.query_params.get('problem', None)
        if problem_id:
            queryset = queryset.filter(problem_id=problem_id)
        
        is_correct = self.request.query_params.get('is_correct', None)
        if is_correct is not None:
            queryset = queryset.filter(is_correct=is_correct.lower() == 'true')
        
        return queryset
    
    def perform_create(self, serializer):
        """Set user automatically on creation"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get submission history for a problem"""
        problem_id = request.query_params.get('problem', None)
        if not problem_id:
            return Response(
                {'error': 'problem parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submissions = Submission.objects.filter(
            user=request.user,
            problem_id=problem_id
        ).order_by('-submitted_at')[:10]
        
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get submission statistics"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        correct = queryset.filter(is_correct=True).count()
        incorrect = total - correct
        
        return Response({
            'total_submissions': total,
            'correct_submissions': correct,
            'incorrect_submissions': incorrect,
            'accuracy_rate': (correct / total * 100) if total > 0 else 0
        })


class UserProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user progress"""
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only access their own progress"""
        return UserProgress.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's progress"""
        progress, created = UserProgress.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(progress)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get detailed statistics"""
        progress, created = UserProgress.objects.get_or_create(user=request.user)
        
        total_problems = Problem.objects.filter(is_active=True).count()
<<<<<<< HEAD
        completed_problems = progress.filter(completed=True).count()
        total_attempts = progress.aggregate(total=Sum('attempts'))['total'] or 0
=======
        solved_count = len(progress.solved_problem_ids)
        
        # Calculate per-difficulty stats
        if progress.solved_problem_ids:
            solved_problems = Problem.objects.filter(id__in=progress.solved_problem_ids)
            difficulty_stats = {
                'easy': solved_problems.filter(difficulty='easy').count(),
                'medium': solved_problems.filter(difficulty='medium').count(),
                'hard': solved_problems.filter(difficulty='hard').count(),
            }
        else:
            difficulty_stats = {'easy': 0, 'medium': 0, 'hard': 0}
>>>>>>> f70a993 (v1 full generation of problem + chat + load topics + django db setup)
        
        return Response({
            'total_problems': total_problems,
            'solved_problems': solved_count,
            'unsolved_problems': total_problems - solved_count,
            'completion_percentage': (solved_count / total_problems * 100) if total_problems > 0 else 0,
            'difficulty_breakdown': difficulty_stats
        })
    
    @action(detail=False, methods=['get'])
    def concepts(self, request):
        """Get learned concepts from solved problems"""
        progress, created = UserProgress.objects.get_or_create(user=request.user)
        
        if not progress.solved_problem_ids:
            return Response({'learned_concepts': []})
        
        # Get all concepts from solved problems
        solved_problems = Problem.objects.filter(id__in=progress.solved_problem_ids)
        
        concepts = set()
        for problem in solved_problems:
            concepts.add(problem.primary_concept)
            if problem.secondary_concepts:
                concepts.update(problem.secondary_concepts)
        
        return Response({
            'learned_concepts': sorted(list(concepts)),
            'total_concepts': len(concepts)
        })


class ChatViewSet(viewsets.ViewSet):
    """ViewSet for chatbot interactions"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def message(self, request):
        """Send message and get AI reply (non-streaming)"""
        print(f"\n========== CHAT REQUEST ==========")
        print(f"Request data: {request.data}")
        print(f"Request user: {request.user}")
        print(f"Is authenticated: {request.user.is_authenticated}")
        
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"❌ Validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"✓ Validation passed: {serializer.validated_data}")
        
        try:
            print(f"Initializing chatbot...")
            chatbot = SQLChatbot()
            print(f"✓ Chatbot initialized")
            user = request.user if request.user.is_authenticated else None
            
            # 优先使用用户的语言设置，如果没有则使用前端传递的语言，最后默认为英文
            language = 'en'
            if user and hasattr(user, 'language') and user.language:
                language = user.language
            elif serializer.validated_data.get('language'):
                language = serializer.validated_data.get('language')
            
            print(f"Calling chatbot.chat with language={language}")
            result = chatbot.chat(
                message=serializer.validated_data['message'],
                thread_id=serializer.validated_data.get('thread_id'),
                user=user,
                problem_id=serializer.validated_data.get('problem_id'),
                language=language
            )
            
            print(f"✓ Chat completed: {result}")
            return Response(result)
            
        except ValueError as e:
            print(f"❌ ValueError: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"❌ Exception: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Chat service error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def stream(self, request):
        """Send message and stream AI reply"""
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chatbot = SQLChatbot()
            user = request.user if request.user.is_authenticated else None
            
            # 优先使用用户的语言设置，如果没有则使用前端传递的语言，最后默认为英文
            language = 'en'
            if user and hasattr(user, 'language') and user.language:
                language = user.language
            elif serializer.validated_data.get('language'):
                language = serializer.validated_data.get('language')
            
            def generate():
                """Generate streaming response"""
                for chunk in chatbot.chat_stream(
                    message=serializer.validated_data['message'],
                    thread_id=serializer.validated_data.get('thread_id'),
                    user=user,
                    problem_id=serializer.validated_data.get('problem_id'),
                    language=language
                ):
                    yield f"data: {json.dumps({'chunk': chunk}, ensure_ascii=False)}\n\n"
                
                yield "data: [DONE]\n\n"
            
            response = StreamingHttpResponse(
                generate(),
                content_type='text/event-stream'
            )
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'
            return response
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Chat service temporarily unavailable'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get chat history for a thread"""
        thread_id = request.query_params.get('thread_id')
        
        if not thread_id:
            return Response(
                {'error': 'thread_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            chatbot = SQLChatbot()
            history = chatbot.get_thread_history(thread_id)
            return Response({'messages': history})
            
        except Exception as e:
            return Response(
                {'error': 'Failed to retrieve history'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def threads(self, request):
        """Get user's chat threads list"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        threads = ChatThread.objects.filter(
            user=request.user,
            is_active=True
        ).order_by('-updated_at')[:20]
        
        serializer = ChatThreadSerializer(threads, many=True)
        return Response(serializer.data)
