from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    مدیریت کاربران در پنل ادمین جنگو
    """
    
    # فیلدهایی که تو لیست کاربران نشون داده میشه
    list_display = [
        'username', 'phone', 'get_full_name', 'role',
        'grade', 'field_of_study', 'counselor_name',
        'is_active', 'date_joined'
    ]
    
    # فیلترهای سمت راست لیست
    list_filter = [
        'role', 'is_active', 'grade', 'field_of_study',
        'counselor', 'date_joined'
    ]
    
    # فیلدهای قابل جستجو
    search_fields = [
        'username', 'phone', 'first_name', 'last_name', 'email'
    ]
    
    # ترتیب نمایش
    ordering = ['-date_joined']
    
    # صفحه‌بندی
    list_per_page = 50
    
    # فیلدهای فقط خواندنی
    readonly_fields = ['date_joined', 'last_login']
    
    # گروه‌بندی فیلدها در صفحه ویرایش کاربر
    fieldsets = (
        # بخش اطلاعات ورود
        (_('اطلاعات ورود'), {
            'fields': ('username', 'password')
        }),
        
        # بخش اطلاعات شخصی
        (_('اطلاعات شخصی'), {
            'fields': (
                'first_name', 'last_name', 'phone', 'email',
                'avatar', 'bio'
            )
        }),
        
        # بخش نقش و دسترسی
        (_('نقش و دسترسی'), {
            'fields': (
                'role', 'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            )
        }),
        
        # بخش اطلاعات تحصیلی (مخصوص دانش‌آموز)
        (_('اطلاعات تحصیلی (ویژه دانش‌آموز)'), {
            'fields': ('grade', 'field_of_study', 'counselor'),
            'classes': ('collapse',)  # این بخش جمع‌شده نمایش داده میشه
        }),
        
        # بخش اطلاعات روانشناس
        (_('اطلاعات تخصصی (ویژه روانشناس)'), {
            'fields': ('license_number',),
            'classes': ('collapse',)
        }),
        
        # بخش تاریخ‌ها
        (_('تاریخ‌های مهم'), {
            'fields': ('date_joined', 'last_login'),
            'classes': ('collapse',)
        }),
    )
    
    # فیلدهای فرم ایجاد کاربر جدید
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'phone', 'password1', 'password2',
                'first_name', 'last_name', 'role',
                'grade', 'field_of_study', 'counselor',
                'is_active', 'is_staff'
            ),
        }),
    )
    
    # برای نمایش اسم مشاور تو لیست
    def counselor_name(self, obj):
        if obj.counselor:
            return obj.counselor.get_full_name()
        return '-'
    counselor_name.short_description = 'مشاور'
    
    # اعمال محدودیت‌های منطقی
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        
        # فیلد counselor فقط مشاورها رو نشون بده
        if 'counselor' in form.base_fields:
            form.base_fields['counselor'].queryset = User.objects.filter(role='counselor')
        
        return form
    
    def save_model(self, request, obj, form, change):
        """
        وقتی ادمین یه کاربر رو ذخیره می‌کنه،
        اگه role اش counselor باشه، is_staff رو True کن
        """
        if obj.role == 'counselor' or obj.role == 'admin' or obj.role == 'psychologist':
            obj.is_staff = True
        else:
            obj.is_staff = False
        
        super().save_model(request, obj, form, change)