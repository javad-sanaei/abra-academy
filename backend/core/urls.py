from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'grades', views.GradeViewSet, basename='grade')
router.register(r'fields', views.FieldOfStudyViewSet, basename='field')
router.register(r'courses', views.CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
]