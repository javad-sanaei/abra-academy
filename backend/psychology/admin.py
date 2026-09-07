from django.contrib import admin
from .models import PsychologyRequest


@admin.register(PsychologyRequest)
class PsychologyRequestAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'student', 'psychologist', 'subject',
        'urgency', 'status', 'created_at'
    ]
    list_filter = ['status', 'urgency', 'psychologist', 'created_at']
    search_fields = ['subject', 'description', 'student__username']
    ordering = ['-created_at']