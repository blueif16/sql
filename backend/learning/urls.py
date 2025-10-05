"""
URL configuration for the learning app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ThemeViewSet, SectionViewSet, ConceptViewSet, ProblemViewSet, UserProgressViewSet

router = DefaultRouter()
router.register(r'themes', ThemeViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'concepts', ConceptViewSet)
router.register(r'problems', ProblemViewSet)
router.register(r'progress', UserProgressViewSet, basename='progress')

urlpatterns = [
    path('', include(router.urls)),
]
