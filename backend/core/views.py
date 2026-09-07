from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Grade, FieldOfStudy, Course
from .serializers import GradeSerializer, FieldOfStudySerializer, CourseSerializer


class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    فقط خوندنی - همه میتونن ببینن
    """
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.AllowAny]


class FieldOfStudyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    فقط خوندنی - همه میتونن ببینن
    """
    queryset = FieldOfStudy.objects.all()
    serializer_class = FieldOfStudySerializer
    permission_classes = [permissions.AllowAny]


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    فقط خوندنی - با قابلیت فیلتر
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]  
    filterset_fields = ['grade', 'field_of_study']