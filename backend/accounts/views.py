from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, UserCreateSerializer, ChangePasswordSerializer
from .permissions import IsAdminUser, IsOwnerOrAdmin


class LoginView(APIView):
    """ورود با username و password - دریافت JWT"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response(
            {'error': 'نام کاربری یا رمز عبور اشتباه است.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        
        if user.is_counselor:
            queryset = queryset.filter(counselor=user)
        
        if role:
            queryset = queryset.filter(role=role)
        
        return queryset


class ChangePasswordView(APIView):
    """تغییر رمز توسط خود کاربر"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        
        if not user.check_password(serializer.data['old_password']):
            return Response(
                {'old_password': 'رمز فعلی اشتباه است.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.data['new_password'])
        user.save()
        return Response({'message': 'رمز عبور با موفقیت تغییر کرد.'})


class ProfileView(APIView):
    """پروفایل کاربر لاگین‌شده"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)