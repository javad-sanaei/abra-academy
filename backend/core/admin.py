from django.contrib import admin
from .models import Grade, FieldOfStudy, Course


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['name', 'order']
    ordering = ['order']


@admin.register(FieldOfStudy)
class FieldOfStudyAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'grade', 'image_preview', 'display_fields']
    list_filter = ['grade', 'field_of_study']
    search_fields = ['name']
    readonly_fields = ['image_preview']
    
    def display_fields(self, obj):
        return ", ".join([f.name for f in obj.field_of_study.all()])
    display_fields.short_description = 'رشته‌ها'
    
    def image_preview(self, obj):
        if obj.image:
            return '✅ دارد'
        return '❌ ندارد'
    image_preview.short_description = 'تصویر'