from django.contrib import admin
from .models import Comment


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'comment_type', 'rating', 'is_active', 'created_at']
    list_filter = ['comment_type', 'is_active', 'rating', 'created_at']
    search_fields = ['content', 'user__username', 'user__first_name', 'user__last_name']
    list_editable = ['is_active']
    ordering = ['-created_at']