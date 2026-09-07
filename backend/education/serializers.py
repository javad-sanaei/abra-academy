from rest_framework import serializers
from .models import Video, Podcast, Note, ExamSample


class VideoSerializer(serializers.ModelSerializer):
    counselor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'video_file',
            'aparat_link', 'thumbnail',
            'counselor', 'counselor_name',
            'has_video', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username
    
    def validate(self, data):
        """حداقل یکی از فایل یا لینک آپارات باید باشه"""
        if not data.get('video_file') and not data.get('aparat_link'):
            raise serializers.ValidationError(
                "باید حداقل یکی از فایل ویدیو یا لینک آپارات را وارد کنید."
            )
        return data


class PodcastSerializer(serializers.ModelSerializer):
    counselor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Podcast
        fields = [
            'id', 'title', 'description', 'audio_file',
            'cover_image',
            'counselor', 'counselor_name', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username


class NoteSerializer(serializers.ModelSerializer):
    counselor_name = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course.name', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    field_name = serializers.CharField(source='field_of_study.name', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'pdf_file',
            'cover_image',
            'course', 'course_name', 'grade', 'grade_name',
            'field_of_study', 'field_name',
            'counselor', 'counselor_name', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username


class ExamSampleSerializer(serializers.ModelSerializer):
    counselor_name = serializers.SerializerMethodField()
    course_name = serializers.CharField(source='course.name', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    field_name = serializers.CharField(source='field_of_study.name', read_only=True)
    
    class Meta:
        model = ExamSample
        fields = [
            'id', 'title', 'description', 'pdf_file',
            'cover_image',
            'course', 'course_name', 'grade', 'grade_name',
            'field_of_study', 'field_name',
            'counselor', 'counselor_name', 'created_at'
        ]
        read_only_fields = ['id', 'counselor', 'created_at']
    
    def get_counselor_name(self, obj):
        return obj.counselor.get_full_name() or obj.counselor.username