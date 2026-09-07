from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    فقط کاربران با نقش admin اجازه دسترسی دارند
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsCounselor(permissions.BasePermission):
    """
    فقط مشاورها
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_counselor


class IsStudent(permissions.BasePermission):
    """
    فقط دانش‌آموزها
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    یا ادمین باشه، یا خود کاربر
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj == request.user
    
from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """فقط کاربران با نقش admin اجازه دسترسی دارند"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsCounselor(permissions.BasePermission):
    """فقط مشاورها"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_counselor


class IsStudent(permissions.BasePermission):
    """فقط دانش‌آموزها"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student


class IsPsychologist(permissions.BasePermission):  # ← اینو اضافه کن
    """فقط روانشناس‌ها"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_psychologist


class IsOwnerOrAdmin(permissions.BasePermission):
    """یا ادمین باشه، یا خود کاربر"""
    def has_object_permission(self, request, view, obj):
        return request.user.is_admin or obj == request.user