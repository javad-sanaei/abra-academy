from rest_framework import serializers
from .models import PsychologyRequest


class PsychologyRequestSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    psychologist_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PsychologyRequest
        fields = [
            'id', 'student', 'student_name',
            'psychologist', 'psychologist_name',
            'subject', 'description', 'urgency',
            'status', 'psychologist_note',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'status', 'psychologist_note', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username
    
    def get_psychologist_name(self, obj):
        if obj.psychologist:
            return obj.psychologist.get_full_name() or obj.psychologist.username
        return None


class PsychologyRequestUpdateSerializer(serializers.ModelSerializer):
    """مخصوص روانشناس برای تغییر وضعیت و نوشتن یادداشت"""
    
    class Meta:
        model = PsychologyRequest
        fields = ['status', 'psychologist_note']