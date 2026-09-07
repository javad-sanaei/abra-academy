from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import StudyPlan, Report, ContactLog
from .serializers import StudyPlanSerializer, ReportSerializer, ContactLogSerializer
from accounts.permissions import IsCounselor, IsStudent
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from django.contrib.auth import get_user_model
from core.models import Course
import jdatetime

from exam.models import ExamResponse
from exam.serializers import ExamResponseSerializer

User = get_user_model()


class StudyPlanViewSet(viewsets.ModelViewSet):
    serializer_class = StudyPlanSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'status', 'plan_date', 'course_name']
    ordering_fields = ['plan_date', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCounselor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return StudyPlan.objects.all()
        elif user.is_counselor:
            return StudyPlan.objects.filter(counselor=user)
        elif user.is_student:
            return StudyPlan.objects.filter(student=user)
        return StudyPlan.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)

    # ===== لیست دانش‌آموزان مشاور =====
    @action(detail=False, methods=['get'], url_path='my-students')
    def my_students(self, request):
        """لیست دانش‌آموزان مشاور"""
        if request.user.is_counselor:
            students = User.objects.filter(counselor=request.user)
            return Response([
                {
                    'id': s.id,
                    'full_name': s.get_full_name() or s.username,
                    'grade': s.grade,
                    'field_of_study': s.field_of_study,
                } for s in students
            ])
        return Response([])

    # ===== درس‌های مربوط به رشته دانش‌آموز =====
    @action(detail=False, methods=['get'], url_path='student-courses')
    def student_courses(self, request):
        """درس‌های مربوط به رشته دانش‌آموز"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response([])
        
        try:
            student = User.objects.get(pk=student_id, role='student')
        except User.DoesNotExist:
            return Response([])
        
        if student.field_of_study:
            courses = Course.objects.filter(
                field_of_study__name=student.field_of_study
            ).distinct()
        else:
            courses = Course.objects.all()
        
        return Response([
            {
                'id': c.id,
                'name': c.name,
                'image': c.image.url if c.image else None,
            } for c in courses
        ])

    # ===== برنامه‌های عقب‌افتاده =====
    @action(detail=False, methods=['get'], url_path='overdue-plans')
    def overdue_plans(self, request):
        """برنامه‌های عقب‌افتاده (missed)"""
        if request.user.is_counselor:
            plans = StudyPlan.objects.filter(
                counselor=request.user,
                status='missed'
            ).order_by('-plan_date')[:10]
            return Response(StudyPlanSerializer(plans, many=True).data)
        return Response([])
    
    # ===== دانش‌آموزان بدون برنامه امروز =====
    @action(detail=False, methods=['get'], url_path='students-without-plans')
    def students_without_plans(self, request):
        """دانش‌آموزانی که برنامه امروز ندارن"""
        if request.user.is_counselor:
            today = jdatetime.date.today().strftime('%Y/%m/%d')
            students_with_plans = StudyPlan.objects.filter(
                counselor=request.user,
                plan_date=today
            ).values_list('student_id', flat=True)
            
            students = User.objects.filter(
                counselor=request.user,
                role='student'
            ).exclude(id__in=students_with_plans)
            
            return Response([
                {
                    'id': s.id,
                    'full_name': s.get_full_name() or s.username,
                    'grade': s.grade,
                    'field_of_study': s.field_of_study,
                } for s in students
            ])
        return Response([])

    # ===== هشدار شهریه =====
    @action(detail=False, methods=['get'], url_path='tuition-alerts')
    def tuition_alerts(self, request):
        """دانش‌آموزانی که شهریه‌شون عقب‌افتاده یا نزدیکه"""
        if request.user.is_counselor:
            students = User.objects.filter(counselor=request.user, role='student')
            alerts = []
            for s in students:
                tuition_status = s.get_tuition_status()
                if tuition_status['status'] in ['overdue', 'due_today', 'due_tomorrow']:
                    alerts.append({
                        'id': s.id,
                        'full_name': s.get_full_name() or s.username,
                        'tuition_status': tuition_status['status'],
                        'days_overdue': tuition_status.get('days_overdue'),
                        'days_remaining': tuition_status.get('days_remaining'),
                        'next_due_date': tuition_status.get('next_due_date'),
                    })
            return Response(alerts)
        return Response([])

    # ===== آمار کامل داشبورد مشاور =====
    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """آمار کامل داشبورد مشاور"""
        if request.user.is_counselor:
            students = User.objects.filter(counselor=request.user, role='student')
            total_students = students.count()
            total_plans = StudyPlan.objects.filter(counselor=request.user).count()
            overdue_plans = StudyPlan.objects.filter(counselor=request.user, status='missed').count()
            pending_plans = StudyPlan.objects.filter(counselor=request.user, status='pending').count()
            total_reports = Report.objects.filter(counselor=request.user).count()
            
            # هشدار شهریه
            tuition_alerts_list = []
            for s in students:
                tuition_status = s.get_tuition_status()
                if tuition_status['status'] in ['overdue', 'due_today', 'due_tomorrow']:
                    tuition_alerts_list.append({
                        'id': s.id,
                        'full_name': s.get_full_name() or s.username,
                        'tuition_status': tuition_status['status'],
                        'days_overdue': tuition_status.get('days_overdue'),
                        'days_remaining': tuition_status.get('days_remaining'),
                        'next_due_date': tuition_status.get('next_due_date'),
                    })
            
            # دانش‌آموزان بدون برنامه امروز
            today = jdatetime.date.today().strftime('%Y/%m/%d')
            students_with_plans = StudyPlan.objects.filter(
                counselor=request.user,
                plan_date=today
            ).values_list('student_id', flat=True)
            
            students_without_plans = students.exclude(id__in=students_with_plans)
            without_plans_list = [
                {
                    'id': s.id,
                    'full_name': s.get_full_name() or s.username,
                    'grade': s.grade,
                    'field_of_study': s.field_of_study,
                } for s in students_without_plans[:5]
            ]
            
            return Response({
                'total_students': total_students,
                'total_plans': total_plans,
                'overdue_plans': overdue_plans,
                'pending_plans': pending_plans,
                'total_reports': total_reports,
                'tuition_alerts': tuition_alerts_list,
                'students_without_plans': without_plans_list,
            })
        return Response({})

    # ===== نمودارهای داشبورد =====
    @action(detail=False, methods=['get'], url_path='dashboard-charts')
    def dashboard_charts(self, request):
        """نمودارهای داشبورد مشاور"""
        if request.user.is_counselor:
            students = User.objects.filter(counselor=request.user, role='student')
            performance = []
            
            for s in students:
                reports = Report.objects.filter(student=s)
                if reports.exists():
                    total_percent = 0
                    count = 0
                    for r in reports:
                        if r.total_questions > 0:
                            total_percent += r.percentage
                            count += 1
                    avg = round(total_percent / count, 1) if count > 0 else 0
                    performance.append({
                        'name': (s.get_full_name() or s.username).split()[0],
                        'percent': avg,
                    })
            
            today = jdatetime.date.today().strftime('%Y/%m/%d')
            today_plans = StudyPlan.objects.filter(counselor=request.user, plan_date=today)
            done = today_plans.filter(status='done').count()
            pending = today_plans.filter(status='pending').count()
            missed = today_plans.filter(status='missed').count()
            
            return Response({
                'performance': performance[:8],
                'today_plan_status': [
                    { 'name': 'انجام شده', 'value': done, 'color': '#10B981' },
                    { 'name': 'در انتظار', 'value': pending, 'color': '#F59E0B' },
                    { 'name': 'انجام نشده', 'value': missed, 'color': '#EF4444' },
                ],
            })
        return Response({})


class ContactLogViewSet(viewsets.ModelViewSet):
    """لاگ تماس‌های مشاور"""
    serializer_class = ContactLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'contact_date', 'contact_type']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_counselor:
            return ContactLog.objects.filter(counselor=user)
        elif user.is_student:
            return ContactLog.objects.filter(student=user)
        return ContactLog.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'counselor', 'report_date', 'course_name', 'topic']
    ordering_fields = ['report_date', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Report.objects.all()
        elif user.is_counselor:
            return Report.objects.filter(counselor=user)
        elif user.is_student:
            return Report.objects.filter(student=user)
        return Report.objects.none()
    
    def perform_create(self, serializer):
        counselor = self.request.user.counselor if self.request.user.is_student else self.request.user
        serializer.save(student=self.request.user, counselor=counselor)

        
    @action(detail=False, methods=['get'], url_path='exam-results')
    def exam_results(self, request):
        """نتایج آزمون‌های دانش‌آموزان مشاور"""
        if request.user.is_counselor:
            from exam.models import ExamResponse
            from exam.serializers import ExamResponseSerializer
            
            student_id = request.query_params.get('student')
            queryset = ExamResponse.objects.filter(student__counselor=request.user)
            
            if student_id:
                queryset = queryset.filter(student_id=student_id)
            
            return Response(ExamResponseSerializer(queryset, many=True).data)
        return Response([])