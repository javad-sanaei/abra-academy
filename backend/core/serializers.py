from rest_framework import serializers
from .models import Grade, FieldOfStudy, Course


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'name', 'order']


class FieldOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOfStudy
        fields = ['id', 'name']


class CourseSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'image', 'image_url', 'grade', 'grade_name', 'field_of_study']
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None