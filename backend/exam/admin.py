from django.contrib import admin
from .models import Exam, Question, Choice, ExamResponse, TestAnswer, EssayAnswer
from .models import Exam, Question, Choice, ExamResponse, TestAnswer, EssayAnswer, ExamSection

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4
    max_num = 4
    min_num = 0
    fields = ['order', 'text', 'is_correct']  # ترتیب درست


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    show_change_link = True
    fields = ['order', 'question_type', 'text', 'image', 'score']

class ExamSectionInline(admin.TabularInline):
    model = ExamSection
    extra = 1


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'exam_type', 'counselor', 'duration', 'entry_start', 'entry_end', 'is_active', 'created_at']
    list_filter = ['exam_type', 'is_active', 'counselor', 'created_at']
    search_fields = ['title', 'counselor__username']
    ordering = ['-created_at']
    inlines = [QuestionInline]
    inlines = [ExamSectionInline, QuestionInline]


@admin.register(ExamSection)
class ExamSectionAdmin(admin.ModelAdmin):
    list_display = ['id', 'exam', 'title', 'course', 'order']
    list_filter = ['exam', 'course']
    ordering = ['exam', 'order']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'exam', 'question_type', 'order', 'score', 'has_text', 'has_image']
    list_filter = ['question_type', 'exam']
    search_fields = ['text', 'exam__title']
    ordering = ['exam', 'order']
    inlines = [ChoiceInline]
    
    def has_text(self, obj):
        return bool(obj.text)
    has_text.boolean = True
    has_text.short_description = 'متن دارد'
    
    def has_image(self, obj):
        return bool(obj.image)
    has_image.boolean = True
    has_image.short_description = 'تصویر دارد'


@admin.register(ExamResponse)
class ExamResponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'exam', 'student', 'started_at', 'finished_at', 'total_score', 'exit_count']
    list_filter = ['exam', 'student']
    search_fields = ['student__username', 'exam__title']
    ordering = ['-started_at']


@admin.register(TestAnswer)
class TestAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'response', 'question', 'choice', 'is_correct']


@admin.register(EssayAnswer)
class EssayAnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'response', 'question', 'score']