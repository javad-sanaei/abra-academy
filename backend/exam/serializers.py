from rest_framework import serializers
from .models import Exam, Question, Choice, ExamResponse, TestAnswer, EssayAnswer, ExamSection


# ===== Choice =====
class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct', 'order']
        read_only_fields = ['id']


class ChoiceListSerializer(serializers.ModelSerializer):
    """برای نمایش گزینه‌ها به دانش‌آموز (بدون is_correct)"""
    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']


# ===== Question =====
class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    section_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'exam', 'section', 'section_title', 'question_type', 'text', 'image',
            'score', 'order', 'choices'
        ]
        read_only_fields = ['id','exam']

    def get_section_title(self, obj):
        return obj.section.title if obj.section else None
    
    def validate(self, data):
        if not data.get('text') and not data.get('image'):
            raise serializers.ValidationError(
                "حداقل متن یا تصویر سوال باید وارد شود."
            )
        return data
    
    def create(self, validated_data):
        # استخراج choices از initial_data (چون read_only هست)
        choices_data = self.initial_data.get('choices', [])
        
        # اگه choices به صورت JSON string اومده، تبدیل کن
        if isinstance(choices_data, str):
            import json
            try:
                choices_data = json.loads(choices_data)
            except json.JSONDecodeError:
                choices_data = []
        
        # ساخت سوال
        question = Question.objects.create(**validated_data)
        
        # ساخت گزینه‌ها
        for choice_data in choices_data:
            Choice.objects.create(
                question=question,
                text=choice_data.get('text', ''),
                is_correct=choice_data.get('is_correct', False),
                order=choice_data.get('order', 1)
            )
        
        return question
    
    def update(self, instance, validated_data):
        choices_data = self.initial_data.get('choices', [])
        
        if isinstance(choices_data, str):
            import json
            try:
                choices_data = json.loads(choices_data)
            except json.JSONDecodeError:
                choices_data = []
        
        # آپدیت فیلدهای سوال
        instance.question_type = validated_data.get('question_type', instance.question_type)
        instance.text = validated_data.get('text', instance.text)
        instance.score = validated_data.get('score', instance.score)
        instance.order = validated_data.get('order', instance.order)
        instance.section = validated_data.get('section', instance.section)
        
        if 'image' in validated_data:
            instance.image = validated_data['image']
        
        instance.save()
        
        # اگه گزینه جدید داریم، قدیمی‌ها رو حذف کن و جدید بساز
        if choices_data:
            instance.choices.all().delete()
            for choice_data in choices_data:
                Choice.objects.create(
                    question=instance,
                    text=choice_data.get('text', ''),
                    is_correct=choice_data.get('is_correct', False),
                    order=choice_data.get('order', 1)
                )
        
        return instance


class QuestionListSerializer(serializers.ModelSerializer):
    """برای نمایش سوالات به دانش‌آموز"""
    choices = ChoiceListSerializer(many=True, read_only=True)
    section_title = serializers.SerializerMethodField()  # ← اضافه کن
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'text', 'image',
            'score', 'order', 'choices', 'section_title'  # ← اضافه شد
        ]
    
    def get_section_title(self, obj):  # ← این تابع رو اضافه کن
        return obj.section.title if obj.section else None


# ===== Exam =====
class ExamSerializer(serializers.ModelSerializer):
    counselor_name = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    motivation_text = serializers.CharField(read_only=True, required=False, allow_null=True)
    advice_text = serializers.CharField(read_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'exam_type', 'score_type', 'duration',
            'entry_start', 'entry_end', 'description', 'file',
            'counselor', 'counselor_name', 'questions_count',
            'motivation_text', 'advice_text',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username
    
    def get_questions_count(self, obj):
        return obj.questions.count()


class ExamSectionSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()
    exam = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = ExamSection
        fields = ['id', 'exam', 'title', 'course', 'course_name', 'order', 'questions_count'] 
        read_only_fields = ['id', 'exam']
    
    def get_course_name(self, obj):
        return obj.course.name if obj.course else None
    
    def get_questions_count(self, obj):
        return obj.questions.count()


class ExamDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    sections = ExamSectionSerializer(many=True, read_only=True)
    counselor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'exam_type', 'score_type', 'duration',
            'entry_start', 'entry_end', 'description', 'file',
            'counselor', 'counselor_name', 'questions', 'sections',  # ← sections اضافه شد
            'is_active', 'created_at'
        ]
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username


class ExamTakeSerializer(serializers.ModelSerializer):
    """نمایش آزمون برای دانش‌آموز (گزینه‌ها بدون is_correct)"""
    questions = QuestionListSerializer(many=True, read_only=True)
    counselor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'exam_type','score_type', 'duration',
            'entry_start', 'entry_end', 'description',
            'counselor', 'counselor_name', 'questions'
        ]
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username


# ===== ExamResponse =====
class TestAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestAnswer
        fields = ['id', 'question', 'choice']
        read_only_fields = ['id']


class EssayAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = EssayAnswer
        fields = ['id', 'question', 'text_answer', 'file_answer', 'score']
        read_only_fields = ['id', 'score']


class ExamResponseSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    exam_title = serializers.SerializerMethodField()  # ← اضافه کن
    test_answers = TestAnswerSerializer(many=True, read_only=True)
    essay_answers = EssayAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = ExamResponse
        fields = [
            'id', 'exam', 'exam_title', 'student', 'student_name',  # ← exam_title اضافه شد
            'started_at', 'finished_at', 'total_score',
            'exit_count', 'test_answers', 'essay_answers'
        ]
        read_only_fields = ['id', 'student', 'started_at', 'finished_at', 'total_score']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
    
    def get_exam_title(self, obj):
        return obj.exam.title

