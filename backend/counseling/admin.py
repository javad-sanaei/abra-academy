from django.contrib import admin
from .models import StudyPlan, Report


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'counselor', 'course_name', 'plan_date', 'study_time', 'status']
    list_filter = ['status', 'plan_date', 'counselor']
    search_fields = ['course_name', 'student__username', 'counselor__username']
    ordering = ['-plan_date']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'student', 'counselor', 'report_date', 'course_name',
        'study_time', 'correct_answers', 'wrong_answers', 'unanswered',
        'total_questions', 'percentage', 'test_time', 'topic'
    ]
    list_filter = ['report_date', 'counselor', 'course_name']
    search_fields = ['course_name', 'topic', 'student__username', 'counselor__username']
    ordering = ['-report_date']