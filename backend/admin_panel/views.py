from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from accounts.models import User
from counseling.models import StudyPlan, Report
from education.models import Video, Podcast, Note, ExamSample
from exam.models import Exam, ExamResponse
from psychology.models import PsychologyRequest
from comments.models import Comment
from comments.serializers import CommentSerializer
from psychology.serializers import PsychologyRequestSerializer
from accounts.permissions import IsAdminUser


class AdminDashboardViewSet(viewsets.ViewSet):
    """داشبورد مدیریت - فقط برای ادمین"""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """آمار کلی"""
        return Response({
            'total_users': User.objects.count(),
            'total_counselors': User.objects.filter(role='counselor').count(),
            'total_students': User.objects.filter(role='student').count(),
            'total_psychologists': User.objects.filter(role='psychologist').count(),
            'total_exams': Exam.objects.count(),
            'total_videos': Video.objects.count(),
            'total_podcasts': Podcast.objects.count(),
            'total_notes': Note.objects.count(),
            'total_exam_samples': ExamSample.objects.count(),
            'total_plans': StudyPlan.objects.count(),
            'total_reports': Report.objects.count(),
            'pending_comments': Comment.objects.filter(is_active=False).count(),
            'pending_psychology_requests': PsychologyRequest.objects.filter(status='pending').count(),
        })
    
    @action(detail=False, methods=['get'], url_path='pending-comments')
    def pending_comments(self, request):
        """کامنت‌های در انتظار تأیید"""
        comments = Comment.objects.filter(is_active=False).order_by('-created_at')[:20]
        return Response(CommentSerializer(comments, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='recent-psychology-requests')
    def recent_psychology_requests(self, request):
        """درخواست‌های روانشناسی در انتظار"""
        requests = PsychologyRequest.objects.filter(status='pending').order_by('-created_at')[:20]
        return Response(PsychologyRequestSerializer(requests, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='comments')
    def all_comments(self, request):
        """همه کامنت‌ها (مدیریت)"""
        is_active = request.query_params.get('is_active')
        queryset = Comment.objects.all().order_by('-created_at')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return Response(CommentSerializer(queryset[:50], many=True).data)
    
    @action(detail=False, methods=['post'], url_path='comments/(?P<comment_id>[^/.]+)/approve')
    def approve_comment(self, request, comment_id=None):
        """تأیید کامنت"""
        comment = Comment.objects.get(pk=comment_id)
        comment.is_active = True
        comment.save()
        return Response({'message': 'کامنت تأیید شد.'})
    
    @action(detail=False, methods=['delete'], url_path='comments/(?P<comment_id>[^/.]+)/delete')
    def delete_comment(self, request, comment_id=None):
        """حذف کامنت"""
        comment = Comment.objects.get(pk=comment_id)
        comment.delete()
        return Response({'message': 'کامنت حذف شد.'})

        # ===== لیست روانشناس‌ها =====
    @action(detail=False, methods=['get'], url_path='psychologists')
    def psychologists_list(self, request):
        psychologists = User.objects.filter(role='psychologist')
        return Response([
            {
                'id': p.id,
                'full_name': p.get_full_name() or p.username,
                'phone': p.phone,
            } for p in psychologists
        ])
    
    # ===== تغییر وضعیت درخواست روانشناسی =====
    @action(detail=False, methods=['patch'], url_path='psychology-requests/(?P<request_id>[^/.]+)/update')
    def update_psychology_request(self, request, request_id=None):
        try:
            psychology_request = PsychologyRequest.objects.get(pk=request_id)
        except PsychologyRequest.DoesNotExist:
            return Response({'error': 'درخواست یافت نشد.'}, status=404)
        
        new_status = request.data.get('status')
        psychologist_id = request.data.get('psychologist_id')
        
        if new_status:
            if new_status not in ['pending', 'reviewing', 'contacted', 'resolved', 'cancelled']:
                return Response({'error': 'وضعیت نامعتبر است.'}, status=400)
            psychology_request.status = new_status
        
        if psychologist_id:
            try:
                psychologist = User.objects.get(pk=psychologist_id, role='psychologist')
                psychology_request.psychologist = psychologist
            except User.DoesNotExist:
                return Response({'error': 'روانشناس یافت نشد.'}, status=404)
        
        psychology_request.save()
        return Response(PsychologyRequestSerializer(psychology_request).data)
    
    # ===== حذف درخواست =====
    @action(detail=False, methods=['delete'], url_path='psychology-requests/(?P<request_id>[^/.]+)/delete')
    def delete_psychology_request(self, request, request_id=None):
        try:
            psychology_request = PsychologyRequest.objects.get(pk=request_id)
        except PsychologyRequest.DoesNotExist:
            return Response({'error': 'درخواست یافت نشد.'}, status=404)
        
        psychology_request.delete()
        return Response({'message': 'درخواست حذف شد.'})