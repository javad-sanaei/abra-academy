from rest_framework import serializers
from .models import Comment


class ReplySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'user_name', 'content', 'rating', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = ReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Comment
        fields = [
            'id', 'user', 'user_name', 'comment_type',
            'related_object_id', 'content', 'rating',
            'is_active', 'parent', 'replies', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'is_active', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username