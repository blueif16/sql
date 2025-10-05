"""
Views for the SQL Learning Platform API.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q, Sum
from .models import Theme, Section, Concept, Problem, UserProgress, QuerySubmission
from .serializers import (
    ThemeSerializer, SectionSerializer, ConceptSerializer, ProblemSerializer,
    UserProgressSerializer, QuerySubmissionSerializer, DetailedThemeSerializer,
    DetailedSectionSerializer, DetailedConceptSerializer
)
from .utils import execute_query, validate_query


class ThemeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for themes."""
    queryset = Theme.objects.filter(is_active=True)
    serializer_class = ThemeSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetailedThemeSerializer
        return ThemeSerializer

    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        """Get all sections for a theme."""
        theme = self.get_object()
        sections = theme.sections.filter(is_active=True).order_by('order')
        serializer = DetailedSectionSerializer(sections, many=True)
        return Response(serializer.data)


class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for sections."""
    queryset = Section.objects.filter(is_active=True)
    serializer_class = SectionSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetailedSectionSerializer
        return SectionSerializer

    @action(detail=True, methods=['get'])
    def concepts(self, request, pk=None):
        """Get all concepts for a section."""
        section = self.get_object()
        concepts = section.concepts.filter(is_active=True).order_by('order')
        serializer = DetailedConceptSerializer(concepts, many=True)
        return Response(serializer.data)


class ConceptViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for concepts."""
    queryset = Concept.objects.filter(is_active=True)
    serializer_class = ConceptSerializer
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetailedConceptSerializer
        return ConceptSerializer

    @action(detail=True, methods=['get'])
    def problems(self, request, pk=None):
        """Get all problems for a concept."""
        concept = self.get_object()
        problems = concept.problems.filter(is_active=True).order_by('order')
        serializer = ProblemSerializer(problems, many=True)
        return Response(serializer.data)


class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for problems."""
    queryset = Problem.objects.filter(is_active=True)
    serializer_class = ProblemSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def submit_query(self, request, pk=None):
        """Submit a query for a problem."""
        problem = self.get_object()
        query = request.data.get('query', '')
        
        if not query:
            return Response(
                {'error': 'Query is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Execute the query
        result = execute_query(query, problem.table_data, problem.table_name)
        
        # Check if the query is correct
        is_correct = False
        user_output = None
        
        if result and result.get('isValid'):
            user_output = result.get('data', [])
            is_correct = user_output == problem.expected_output
        
        # Save the submission
        submission = QuerySubmission.objects.create(
            user=request.user,
            problem=problem,
            query=query,
            is_correct=is_correct,
            user_output=user_output
        )
        
        # Update user progress
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            problem=problem
        )
        
        progress.attempts += 1
        if not progress.first_attempt_at:
            progress.first_attempt_at = submission.submitted_at
        
        if is_correct and not progress.completed:
            progress.completed = True
            progress.completed_at = submission.submitted_at
        
        progress.save()
        
        return Response({
            'is_correct': is_correct,
            'user_output': user_output,
            'expected_output': problem.expected_output,
            'submission_id': submission.id,
            'progress': UserProgressSerializer(progress).data
        })

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def progress(self, request, pk=None):
        """Get user progress for a problem."""
        problem = self.get_object()
        try:
            progress = UserProgress.objects.get(user=request.user, problem=problem)
            serializer = UserProgressSerializer(progress)
            return Response(serializer.data)
        except UserProgress.DoesNotExist:
            return Response({
                'completed': False,
                'attempts': 0,
                'first_attempt_at': None,
                'completed_at': None
            })


class UserProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user progress."""
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics."""
        progress = self.get_queryset()
        
        total_problems = Problem.objects.filter(is_active=True).count()
        completed_problems = progress.filter(completed=True).count()
        total_attempts = progress.aggregate(total=models.Sum('attempts'))['total'] or 0
        
        return Response({
            'total_problems': total_problems,
            'completed_problems': completed_problems,
            'completion_percentage': (completed_problems / total_problems * 100) if total_problems > 0 else 0,
            'total_attempts': total_attempts
        })
