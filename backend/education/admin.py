from django.contrib import admin
from .models import Video, Podcast, Note, ExamSample


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'counselor', 'has_video', 'created_at']
    list_filter = ['counselor', 'created_at']
    search_fields = ['title', 'counselor__username']


@admin.register(Podcast)
class PodcastAdmin(admin.ModelAdmin):
    list_display = ['title', 'counselor', 'created_at']
    list_filter = ['counselor', 'created_at']
    search_fields = ['title', 'counselor__username']


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'grade', 'display_fields', 'counselor', 'created_at']
    list_filter = ['grade', 'field_of_study', 'course', 'counselor']
    search_fields = ['title', 'counselor__username']
    
    def display_fields(self, obj):
        return ", ".join([f.name for f in obj.field_of_study.all()])
    display_fields.short_description = 'رشته‌ها'


@admin.register(ExamSample)
class ExamSampleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'grade', 'display_fields', 'counselor', 'created_at']
    list_filter = ['grade', 'field_of_study', 'course', 'counselor']
    search_fields = ['title', 'counselor__username']
    
    def display_fields(self, obj):
        return ", ".join([f.name for f in obj.field_of_study.all()])
    display_fields.short_description = 'رشته‌ها'