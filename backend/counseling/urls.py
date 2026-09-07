from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.StudyPlanViewSet, basename='plan')
router.register(r'reports', views.ReportViewSet, basename='report')
router.register(r'contacts', views.ContactLogViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
    # ✅ مسیر جدا:
    path('exam-results/', views.ReportViewSet.as_view({'get': 'exam_results'}), name='exam-results'),
]