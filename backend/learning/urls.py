"""
URL configuration for the learning app - Based on schema.sql
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConceptViewSet, InterestAreaViewSet, UserRoleViewSet, PreferenceViewSet,
    ProblemViewSet, SubmissionViewSet,
    UserProgressViewSet, ChatViewSet, auto_login, update_user_language
)

router = DefaultRouter()
router.register(r'concepts', ConceptViewSet, basename='concept')
router.register(r'interests', InterestAreaViewSet, basename='interest')
router.register(r'roles', UserRoleViewSet, basename='role')
router.register(r'preferences', PreferenceViewSet, basename='preference')
router.register(r'problems', ProblemViewSet, basename='problem')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'progress', UserProgressViewSet, basename='progress')
router.register(r'chat', ChatViewSet, basename='chat')

urlpatterns = [
    path('auth/auto-login/', auto_login, name='auto-login'),
    path('user/language/', update_user_language, name='update-user-language'),
    path('', include(router.urls)),
]
