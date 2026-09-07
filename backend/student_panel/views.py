from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import date, timedelta
import jdatetime

from counseling.models import StudyPlan, Report, StudentTodo, MotivationalQuote, StudentGoal
from counseling.serializers import (
    StudyPlanSerializer, ReportSerializer,
    StudentTodoSerializer, MotivationalQuoteSerializer, StudentGoalSerializer
)
from education.models import Video, Podcast, Note, ExamSample
from education.serializers import (
    VideoSerializer, PodcastSerializer,
    NoteSerializer, ExamSampleSerializer
)
from exam.models import Exam, ExamResponse
from exam.serializers import ExamSerializer, ExamResponseSerializer
from psychology.models import PsychologyRequest
from psychology.serializers import PsychologyRequestSerializer
from accounts.permissions import IsStudent
from core.models import Course

from django.db.models import Q


class StudentDashboardViewSet(viewsets.ViewSet):
    """داشبورد دانش‌آموز — Premium Edition"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    # ==========================================
    # 🔥 آمار کامل داشبورد (پیشرفته)
    # ==========================================
    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        user = request.user
        
        # تاریخ امروز شمسی
        today_jalali = jdatetime.date.today()
        today_str_slash = today_jalali.strftime('%Y/%m/%d')
        today_str_dash = today_jalali.strftime('%Y-%m-%d')
        
        # ─── آمار اصلی ───
        total_plans = StudyPlan.objects.filter(student=user).count()
        pending_plans = StudyPlan.objects.filter(student=user, status='pending').count()
        done_plans = StudyPlan.objects.filter(student=user, status='done').count()
        total_reports = Report.objects.filter(student=user).count()
        total_exams = Exam.objects.filter(counselor=user.counselor, is_active=True).count() if user.counselor else 0
        completed_exams = ExamResponse.objects.filter(student=user, finished_at__isnull=False).count()
        
        # ─── برنامه‌های امروز ───
        today_plans = StudyPlan.objects.filter(
            student=user
        ).filter(
            Q(plan_date=today_str_slash) | Q(plan_date=today_str_dash)
        ).order_by('study_time')
        
        today_tasks = []
        today_schedule = []
        for plan in today_plans:
            task = {
                'id': plan.id,
                'title': plan.course_name,
                'description': plan.description,
                'time': plan.study_time or '',
                'done': plan.status == 'done',
                'lesson': plan.course_name,
            }
            today_tasks.append(task)
            
            schedule = {
                'id': plan.id,
                'title': plan.course_name,
                'time': plan.study_time or '',
                'type': 'study',
                'status': plan.status,
            }
            today_schedule.append(schedule)
        
        # ─── فعالیت‌های اخیر ───
        recent_activities = []
        
        last_reports = Report.objects.filter(student=user).order_by('-created_at')[:3]
        for report in last_reports:
            recent_activities.append({
                'type': 'report',
                'title': f'گزارش {report.course_name} ثبت شد',
                'subtitle': f'{report.study_time} ساعت مطالعه',
                'time': self._time_ago(report.created_at),
                'icon': 'FileText',
                'color': '#8B5CF6',
            })
        
        last_exam_results = ExamResponse.objects.filter(
            student=user, finished_at__isnull=False
        ).order_by('-finished_at')[:2]
        for result in last_exam_results:
            recent_activities.append({
                'type': 'exam',
                'title': f'آزمون {result.exam.title} تکمیل شد',
                'subtitle': f'نمره: {result.total_score}',
                'time': self._time_ago(result.finished_at),
                'icon': 'GraduationCap',
                'color': '#10B981',
            })
        
        last_status_changes = StudyPlan.objects.filter(
            student=user
        ).exclude(status='pending').order_by('-created_at')[:3]
        for plan in last_status_changes:
            status_text = 'انجام شد ✅' if plan.status == 'done' else 'انجام نشد ❌'
            recent_activities.append({
                'type': 'plan',
                'title': f'{plan.course_name} - {status_text}',
                'subtitle': plan.plan_date,
                'time': self._time_ago(plan.created_at),
                'icon': 'CalendarCheck',
                'color': '#3B82F6',
            })
        
        recent_activities.sort(key=lambda x: x['time'], reverse=True)
        recent_activities = recent_activities[:5]
        
        # ─── استریک ───
        streak = self._calculate_streak(user, today_jalali)
        
        # ─── دستاوردها ───
        achievements = [
            {
                'title': f'{streak} روز پیاپی',
                'sub': 'مطالعه مداوم',
                'icon': 'Flame',
                'color': '#F59E0B',
            },
            {
                'title': f'{completed_exams} آزمون',
                'sub': 'تکمیل شده',
                'icon': 'Zap',
                'color': '#3B82F6',
            },
            {
                'title': f'{total_reports} گزارش',
                'sub': 'ثبت شده',
                'icon': 'Bookmark',
                'color': '#8B5CF6',
            },
        ]
        
        # ─── درصد پیشرفت هفتگی ───
        week_start = today_jalali - jdatetime.timedelta(days=today_jalali.weekday())
        week_start_str_slash = week_start.strftime('%Y/%m/%d')
        week_start_str_dash = week_start.strftime('%Y-%m-%d')
        
        week_plans_count = StudyPlan.objects.filter(
            student=user
        ).filter(
            Q(plan_date__gte=week_start_str_slash) | Q(plan_date__gte=week_start_str_dash)
        ).count()
        week_done_count = StudyPlan.objects.filter(
            student=user,
            status='done'
        ).filter(
            Q(plan_date__gte=week_start_str_slash) | Q(plan_date__gte=week_start_str_dash)
        ).count()
        weekly_progress = int((week_done_count / week_plans_count * 100)) if week_plans_count > 0 else 0
        
        # ─── XP ───
        xp = total_reports * 10 + completed_exams * 50
        level = 'برنزی 🥉'
        if xp >= 5000:
            level = 'طلایی 🥇'
        elif xp >= 2000:
            level = 'نقره‌ای 🥈'
        
        # ─── جمله انگیزشی امروز ───
        day_of_year = today_jalali.timetuple().tm_yday
        quote = MotivationalQuote.objects.filter(day_of_year=day_of_year).first()
        
        # ─── هدف فعال ───
        active_goal = None
        goal = StudentGoal.objects.filter(student=user, is_active=True).first()
        if goal:
            active_goal = StudentGoalSerializer(goal).data
        
        # ✅ وضعیت شهریه
        tuition_status = user.get_tuition_status()
        
        return Response({
            # اصلی
            'total_plans': total_plans,
            'pending_plans': pending_plans,
            'done_plans': done_plans,
            'total_reports': total_reports,
            'total_exams': total_exams,
            'completed_exams': completed_exams,
            'lessons': total_reports,
            
            # جدید
            'weekly_progress': weekly_progress,
            'today_tasks': today_tasks,
            'today_schedule': today_schedule,
            'recent_activities': recent_activities,
            'achievements': achievements,
            'streak': streak,
            'xp': xp,
            'level': level,
            'active_goal': active_goal,
            'daily_quote': MotivationalQuoteSerializer(quote).data if quote else None,
            'tuition_status': tuition_status,  # ✅ اضافه شد
        })
    
    # ==========================================
    # 📅 برنامه‌های امروز
    # ==========================================
    @action(detail=False, methods=['get'], url_path='today-plans')
    def today_plans(self, request):
        today_str = jdatetime.date.today().strftime('%Y/%m/%d')
        plans = StudyPlan.objects.filter(
            student=request.user,
            plan_date=today_str
        ).order_by('study_time')
        return Response(StudyPlanSerializer(plans, many=True).data)
    
    # ==========================================
    # ✅ تیک زدن برنامه
    # ==========================================
    @action(detail=False, methods=['patch'], url_path='plans/(?P<plan_id>[^/.]+)/toggle')
    def toggle_plan(self, request, plan_id=None):
        try:
            plan = StudyPlan.objects.get(pk=plan_id, student=request.user)
        except StudyPlan.DoesNotExist:
            return Response({'error': 'برنامه یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        plan.status = 'pending' if plan.status == 'done' else 'done'
        plan.save()
        
        return Response(StudyPlanSerializer(plan).data)
    
    # ==========================================
    # برنامه‌ها
    # ==========================================
    @action(detail=False, methods=['get'], url_path='plans')
    def my_plans(self, request):
        plans = StudyPlan.objects.filter(student=request.user).order_by('-plan_date')
        status_filter = request.query_params.get('status')
        if status_filter:
            plans = plans.filter(status=status_filter)
        return Response(StudyPlanSerializer(plans, many=True).data)
    
    @action(detail=False, methods=['patch'], url_path='plans/(?P<plan_id>[^/.]+)/update-status')
    def update_plan_status(self, request, plan_id=None):
        try:
            plan = StudyPlan.objects.get(pk=plan_id, student=request.user)
        except StudyPlan.DoesNotExist:
            return Response({'error': 'برنامه یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        new_status = request.data.get('status')
        if new_status not in ['pending', 'done', 'missed']:
            return Response({'error': 'وضعیت نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)
        
        plan.status = new_status
        plan.save()
        return Response(StudyPlanSerializer(plan).data)
    
    # ==========================================
    # ✅ To-Do List
    # ==========================================
    @action(detail=False, methods=['get', 'post'], url_path='todos')
    def my_todos(self, request):
        today_str = jdatetime.date.today().strftime('%Y/%m/%d')
        
        if request.method == 'GET':
            date_filter = request.query_params.get('date', today_str)
            todos = StudentTodo.objects.filter(
                student=request.user,
                date=date_filter
            ).order_by('-created_at')
            return Response(StudentTodoSerializer(todos, many=True).data)
        
        else:
            serializer = StudentTodoSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['patch', 'delete'], url_path='todos/(?P<todo_id>[^/.]+)')
    def todo_detail(self, request, todo_id=None):
        try:
            todo = StudentTodo.objects.get(pk=todo_id, student=request.user)
        except StudentTodo.DoesNotExist:
            return Response({'error': 'تسک یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'DELETE':
            todo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        else:
            if 'is_done' in request.data:
                todo.is_done = request.data['is_done']
                todo.save()
            else:
                serializer = StudentTodoSerializer(todo, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            return Response(StudentTodoSerializer(todo).data)
    
    # ==========================================
    # 🎯 اهداف
    # ==========================================
    @action(detail=False, methods=['get', 'post'], url_path='goals')
    def my_goals(self, request):
        if request.method == 'GET':
            goals = StudentGoal.objects.filter(student=request.user).order_by('-created_at')
            return Response(StudentGoalSerializer(goals, many=True).data)
        
        else:
            serializer = StudentGoalSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['patch', 'delete'], url_path='goals/(?P<goal_id>[^/.]+)')
    def goal_detail(self, request, goal_id=None):
        try:
            goal = StudentGoal.objects.get(pk=goal_id, student=request.user)
        except StudentGoal.DoesNotExist:
            return Response({'error': 'هدف یافت نشد.'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'DELETE':
            goal.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        else:
            serializer = StudentGoalSerializer(goal, data=request.data, partial=True, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
    
    # ==========================================
    # 📊 گزارش‌ها
    # ==========================================
    @action(detail=False, methods=['get'], url_path='reports')
    def my_reports(self, request):
        reports = Report.objects.filter(student=request.user).order_by('-report_date')
        return Response(ReportSerializer(reports, many=True).data)
    
    @action(detail=False, methods=['post'], url_path='reports/create')
    def create_report(self, request):
        serializer = ReportSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        report = serializer.save(
            student=request.user,
            counselor=request.user.counselor
        )
        
        self._update_goal_progress(request.user, report)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # ==========================================
    # 📚 لیست درس‌ها
    # ==========================================
    @action(detail=False, methods=['get'], url_path='courses-list')
    def courses_list(self, request):
        courses = Course.objects.all()
        return Response([
            {
                'id': c.id,
                'name': c.name,
                'image': c.image.url if c.image else None,
            } for c in courses
        ])
    
    # ==========================================
    # محتوای آموزشی
    # ==========================================
    @action(detail=False, methods=['get'], url_path='videos')
    def my_videos(self, request):
        if not request.user.counselor:
            return Response([])
        videos = Video.objects.filter(counselor=request.user.counselor)
        return Response(VideoSerializer(videos, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='podcasts')
    def my_podcasts(self, request):
        if not request.user.counselor:
            return Response([])
        podcasts = Podcast.objects.filter(counselor=request.user.counselor)
        return Response(PodcastSerializer(podcasts, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='notes')
    def my_notes(self, request):
        if not request.user.counselor:
            return Response([])
        notes = Note.objects.filter(counselor=request.user.counselor)
        grade = request.query_params.get('grade')
        field = request.query_params.get('field')
        course = request.query_params.get('course')
        if grade:
            notes = notes.filter(grade_id=grade)
        if field:
            notes = notes.filter(field_of_study__id=field)
        if course:
            notes = notes.filter(course_id=course)
        return Response(NoteSerializer(notes, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='exam-samples')
    def my_exam_samples(self, request):
        if not request.user.counselor:
            return Response([])
        samples = ExamSample.objects.filter(counselor=request.user.counselor)
        grade = request.query_params.get('grade')
        field = request.query_params.get('field')
        course = request.query_params.get('course')
        if grade:
            samples = samples.filter(grade_id=grade)
        if field:
            samples = samples.filter(field_of_study__id=field)
        if course:
            samples = samples.filter(course_id=course)
        return Response(ExamSampleSerializer(samples, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='exams')
    def my_exams(self, request):
        if not request.user.counselor:
            return Response([])
        exams = Exam.objects.filter(counselor=request.user.counselor, is_active=True)
        return Response(ExamSerializer(exams, many=True).data)
    
    @action(detail=False, methods=['get'], url_path='exam-results')
    def my_exam_results(self, request):
        results = ExamResponse.objects.filter(student=request.user).order_by('-finished_at')
        return Response(ExamResponseSerializer(results, many=True).data)
    
    @action(detail=False, methods=['get', 'post'], url_path='psychology-requests')
    def my_psychology_requests(self, request):
        if request.method == 'GET':
            requests_list = PsychologyRequest.objects.filter(
                student=request.user
            ).order_by('-created_at')
            return Response(PsychologyRequestSerializer(requests_list, many=True).data)
        else:
            serializer = PsychologyRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    # ==========================================
    # 🔧 توابع کمکی
    # ==========================================
    
    def _calculate_streak(self, user, today_jalali):
        streak = 0
        
        for i in range(1, 365):
            check_date = today_jalali - jdatetime.timedelta(days=i)
            check_date_str = check_date.strftime('%Y/%m/%d')
            
            has_activity = StudyPlan.objects.filter(
                student=user,
                plan_date=check_date_str,
                status='done'
            ).exists() or Report.objects.filter(
                student=user,
                report_date=check_date_str
            ).exists()
            
            if has_activity:
                streak += 1
            else:
                break
        
        return streak
    
    def _update_goal_progress(self, user, report):
        goal = StudentGoal.objects.filter(student=user, is_active=True).first()
        if not goal:
            return
        
        if goal.goal_type == 'study_hours':
            goal.current_value += int(float(report.study_time))
        elif goal.goal_type in ['tests', 'lessons', 'exercise', 'meditation', 'reading', 'custom']:
            goal.current_value += 1
        
        goal.save()
    
    def _time_ago(self, dt):
        from django.utils import timezone
        
        now = timezone.now()
        diff = now - dt
        
        if diff.days > 30:
            return f'{diff.days // 30} ماه پیش'
        elif diff.days > 0:
            return f'{diff.days} روز پیش'
        elif diff.seconds > 3600:
            return f'{diff.seconds // 3600} ساعت پیش'
        elif diff.seconds > 60:
            return f'{diff.seconds // 60} دقیقه پیش'
        else:
            return 'همین الان'