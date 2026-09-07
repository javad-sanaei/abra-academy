from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = Comment.objects.filter(is_active=True)
        comment_type = self.request.query_params.get('type')
        related_id = self.request.query_params.get('related_id')
        
        if comment_type:
            queryset = queryset.filter(comment_type=comment_type)
        if related_id:
            queryset = queryset.filter(related_object_id=related_id)
        
        return queryset.filter(parent=None)  # فقط کامنت‌های اصلی
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_active=False)