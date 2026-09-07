from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    نمایش اطلاعات کاربر (برای GET)
    رمز رو نشون نمیده
    """
    full_name = serializers.SerializerMethodField()
    tuition_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'email',
            'avatar', 'bio', 'grade', 'field_of_study',
            'counselor', 'license_number', 'is_active',
            'tuition_amount', 'tuition_day', 'last_payment_date',
            'tuition_status',
            'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'tuition_status']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_tuition_status(self, obj):
        """وضعیت شهریه از متد مدل"""
        return obj.get_tuition_status()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    مخصوص ایجاد کاربر جدید توسط ادمین
    رمز رو می‌گیره و اعتبارسنجی می‌کنه
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'email', 'role',
            'grade', 'field_of_study', 'counselor',
            'license_number', 'bio',
            'tuition_amount', 'tuition_day', 'last_payment_date',
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "رمزها مطابقت ندارند!"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    برای تغییر رمز توسط خود کاربر
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "رمزهای جدید مطابقت ندارند!"})
        return data