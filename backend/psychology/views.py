from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import PsychologyRequest
from .serializers import (
    PsychologyRequestSerializer,
    PsychologyRequestUpdateSerializer
)
from accounts.permissions import IsPsychologist, IsStudent


class PsychologyRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PsychologyRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'urgency', 'psychologist']
    ordering_fields = ['created_at']
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsStudent()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return PsychologyRequest.objects.all()
        elif user.is_psychologist:
            return PsychologyRequest.objects.filter(psychologist=user)
        elif user.is_student:
            return PsychologyRequest.objects.filter(student=user)
        return PsychologyRequest.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    # ===== روانشناس درخواست رو قبول می‌کنه =====
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def accept(self, request, pk=None):
        req = self.get_object()
        if req.status != 'pending':
            return Response(
                {'error': 'این درخواست قبلاً بررسی شده است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        req.psychologist = request.user
        req.status = 'reviewing'
        req.save()
        return Response({'message': 'درخواست با موفقیت پذیرفته شد.'})
    
    # ===== روانشناس وضعیت رو تغییر میده =====
    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsPsychologist])
    def update_status(self, request, pk=None):
        req = self.get_object()
        if req.psychologist != request.user:
            return Response(
                {'error': 'شما مجاز به تغییر این درخواست نیستید.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PsychologyRequestUpdateSerializer(req, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'وضعیت با موفقیت بروزرسانی شد.'})