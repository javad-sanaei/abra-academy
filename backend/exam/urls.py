from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from . import views

router = DefaultRouter()
router.register(r'', views.ExamViewSet, basename='exam')

# Nested router برای سوالات زیر هر آزمون
exams_router = routers.NestedDefaultRouter(router, r'', lookup='exam')
exams_router.register(r'questions', views.QuestionViewSet, basename='exam-questions')
exams_router.register(r'sections', views.ExamSectionViewSet, basename='exam-sections')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(exams_router.urls)),
]