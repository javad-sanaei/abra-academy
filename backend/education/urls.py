from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'videos', views.VideoViewSet, basename='video')
router.register(r'podcasts', views.PodcastViewSet, basename='podcast')
router.register(r'notes', views.NoteViewSet, basename='note')
router.register(r'exam-samples', views.ExamSampleViewSet, basename='exam-sample')

urlpatterns = [
    path('', include(router.urls)),
]