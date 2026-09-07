from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Video, Podcast, Note, ExamSample
from .serializers import (
    VideoSerializer, PodcastSerializer,
    NoteSerializer, ExamSampleSerializer
)
from accounts.permissions import IsCounselor, IsStudent


class VideoViewSet(viewsets.ModelViewSet):
    serializer_class = VideoSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['counselor']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCounselor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_counselor:
            return Video.objects.filter(counselor=user) if user.is_counselor else Video.objects.all()
        elif user.is_student and user.counselor:
            return Video.objects.filter(counselor=user.counselor)
        return Video.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)


class PodcastViewSet(viewsets.ModelViewSet):
    serializer_class = PodcastSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['counselor']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCounselor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin or user.is_counselor:
            return Podcast.objects.filter(counselor=user) if user.is_counselor else Podcast.objects.all()
        elif user.is_student and user.counselor:
            return Podcast.objects.filter(counselor=user.counselor)
        return Podcast.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['course', 'grade', 'counselor']  # ← field_of_study رو حذف کن
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCounselor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Note.objects.all()
        
        if user.is_admin:
            queryset = Note.objects.all()
        elif user.is_counselor:
            queryset = Note.objects.filter(counselor=user)
        elif user.is_student and user.counselor:
            queryset = Note.objects.filter(counselor=user.counselor)
        else:
            return Note.objects.none()
        
        # فیلتر ManyToMany برای field_of_study
        field_id = self.request.query_params.get('field')
        if field_id:
            queryset = queryset.filter(field_of_study__id=field_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)


class ExamSampleViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSampleSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['course', 'grade', 'counselor']  # ← field_of_study رو حذف کن
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCounselor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        queryset = ExamSample.objects.all()
        
        if user.is_admin:
            queryset = ExamSample.objects.all()
        elif user.is_counselor:
            queryset = ExamSample.objects.filter(counselor=user)
        elif user.is_student and user.counselor:
            queryset = ExamSample.objects.filter(counselor=user.counselor)
        else:
            return ExamSample.objects.none()
        
        # فیلتر ManyToMany برای field_of_study
        field_id = self.request.query_params.get('field')
        if field_id:
            queryset = queryset.filter(field_of_study__id=field_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)