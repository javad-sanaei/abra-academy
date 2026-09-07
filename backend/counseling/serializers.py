from rest_framework import serializers
from .models import StudyPlan, Report, Goal
from .models import StudyPlan, Report, StudentTodo, MotivationalQuote, StudentGoal
from .models import StudyPlan, Report, StudentTodo, MotivationalQuote, StudentGoal, ContactLog

class StudyPlanSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    counselor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyPlan
        fields = [
            'id', 'counselor', 'counselor_name', 'student', 'student_name',
            'plan_date', 'course_name', 'study_time', 'description',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username
    
    def validate(self, data):
        """مشاور فقط می‌تونه برای دانش‌آموزان خودش برنامه بذاره"""
        request = self.context.get('request')
        if request and request.user.is_counselor:
            student = data.get('student')
            if student and student.counselor != request.user:
                raise serializers.ValidationError(
                    "شما فقط می‌تونید برای دانش‌آموزان خودتان برنامه بگذارید."
                )
        return data


class ReportSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    counselor_name = serializers.SerializerMethodField()
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    counselor = serializers.PrimaryKeyRelatedField(read_only=True)
    total_questions = serializers.IntegerField(read_only=True)
    percentage = serializers.FloatField(read_only=True)
    course_name = serializers.SerializerMethodField()
    course_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'student', 'student_name', 'counselor', 'counselor_name',
            'report_date', 'course', 'course_name', 'course_image',
            'study_time', 'correct_answers', 'wrong_answers', 'unanswered',
            'total_questions', 'percentage', 'test_time',
            'topic', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'counselor', 'created_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username
    
    def get_course_name(self, obj):
        if obj.course:
            return obj.course.name
        return obj.course_name
    
    def get_course_image(self, obj):
        if obj.course and obj.course.image:
            return obj.course.image.url
        return None
    
    def validate(self, data):
        """دانش‌آموز فقط می‌تونه برای مشاور خودش گزارش بفرسته"""
        request = self.context.get('request')
        
        # اگه course انتخاب شده، course_name خودکار پر بشه
        course = data.get('course')
        if course:
            data['course_name'] = course.name
        
        if request and request.user.is_student:
            if request.user.counselor:
                data['counselor'] = request.user.counselor
            else:
                raise serializers.ValidationError("شما مشاوری ندارید.")
        return data


# ===== Serializer هدف‌گذاری =====

class GoalSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    progress_percentage = serializers.IntegerField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Goal
        fields = [
            'id', 'student', 'student_name',
            'title', 'description', 'target_type',
            'target_value', 'current_value',
            'start_date', 'end_date',
            'progress_percentage', 'days_remaining',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'current_value', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
    
    def validate(self, data):
        request = self.context.get('request')
        if request and request.user.is_student:
            # هر دانش‌آموز فقط یه هدف فعال می‌تونه داشته باشه
            if Goal.objects.filter(student=request.user, is_active=True).exists():
                if self.instance is None:  # ایجاد جدید
                    raise serializers.ValidationError(
                        "شما یک هدف فعال دارید. ابتدا آن را کامل یا حذف کنید."
                    )
        return data


class StudentTodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentTodo
        fields = ['id', 'title', 'date', 'is_done', 'created_at']
        read_only_fields = ['id', 'created_at']


class MotivationalQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MotivationalQuote
        fields = ['id', 'quote', 'author', 'day_of_year']


class StudentGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.IntegerField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    goal_type_display = serializers.CharField(source='get_goal_type_display', read_only=True)
    
    class Meta:
        model = StudentGoal
        fields = [
            'id', 'title', 'goal_type', 'goal_type_display',
            'target_value', 'current_value',
            'start_date', 'end_date',
            'progress_percentage', 'days_remaining',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_value', 'created_at', 'updated_at']
    
    def validate(self, data):
        request = self.context.get('request')
        if request and request.user.is_student:
            # فقط یه هدف فعال
            if StudentGoal.objects.filter(student=request.user, is_active=True).exists():
                if self.instance is None:
                    # غیرفعال کردن هدف قبلی
                    StudentGoal.objects.filter(student=request.user, is_active=True).update(is_active=False)
        return data

class StudyPlanSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    counselor_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    course_image = serializers.SerializerMethodField()
    
    class Meta:
        model = StudyPlan
        fields = [
            'id', 'counselor', 'counselor_name', 'student', 'student_name',
            'plan_date', 'course', 'course_name', 'course_image',
            'study_time', 'description', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username
    
    def get_course_name(self, obj):
        if obj.course:
            return obj.course.name
        return obj.course_name
    
    def get_course_image(self, obj):
        if obj.course and obj.course.image:
            return obj.course.image.url
        return None
    
    def validate(self, data):
        request = self.context.get('request')
        
        # اگه course انتخاب شده، course_name رو خودکار پر کن
        course = data.get('course')
        if course:
            data['course_name'] = course.name
        
        if request and request.user.is_counselor:
            student = data.get('student')
            if student and student.counselor != request.user:
                raise serializers.ValidationError(
                    "شما فقط می‌تونید برای دانش‌آموزان خودتان برنامه بگذارید."
                )
        return data

class ContactLogSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactLog
        fields = ['id', 'counselor', 'student', 'student_name', 'contact_date', 'contact_type', 'note', 'created_at']
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username