from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
import jdatetime


class User(AbstractUser):
    """
    مدل سفارشی کاربر با نقش‌های مختلف
    """
    
    class Role(models.TextChoices):
        ADMIN = 'admin', 'ادمین'
        COUNSELOR = 'counselor', 'مشاور'
        STUDENT = 'student', 'دانش‌آموز'
        PSYCHOLOGIST = 'psychologist', 'روانشناس'
    
    # اعتبارسنجی شماره موبایل ایران
    phone_regex = RegexValidator(
        regex=r'^09\d{9}$',
        message="شماره موبایل باید با 09 شروع و 11 رقمی باشد."
    )
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name="نقش کاربر"
    )
    phone = models.CharField(
        max_length=11,
        unique=True,
        validators=[phone_regex],
        verbose_name="شماره موبایل"
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name="تصویر پروفایل"
    )
    bio = models.TextField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name="بیوگرافی"
    )
    
    # این فیلدها فقط برای دانش‌آموزها پر میشن
    grade = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="پایه تحصیلی"
    )
    field_of_study = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        verbose_name="رشته تحصیلی"
    )
    counselor = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )

    # ===== سیستم شهریه ماهانه =====
    tuition_amount = models.DecimalField(
        max_digits=10, decimal_places=0,
        null=True, blank=True,
        verbose_name="مبلغ شهریه (تومان)"
    )
    tuition_day = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="روز پرداخت شهریه (۱ تا ۳۰)"
    )
    last_payment_date = models.CharField(
        max_length=20,
        null=True, blank=True,
        verbose_name="آخرین پرداخت (مثلاً 1405/05/10)"
    )
    # ================================
    
    # فیلد اضافه برای روانشناس
    license_number = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="شماره نظام روانشناسی"
    )
    
    
    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"
        ordering = ['-date_joined']
    
    def __str__(self):
        if self.get_full_name():
            return f"{self.get_full_name()} ({self.get_role_display()})"
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_counselor(self):
        return self.role == self.Role.COUNSELOR
    
    @property
    def is_student(self):
        return self.role == self.Role.STUDENT
    
    @property
    def is_psychologist(self):
        return self.role == self.Role.PSYCHOLOGIST
    
    # ===== متد وضعیت شهریه =====
    def get_tuition_status(self):
        """
        وضعیت شهریه رو حساب کن:
        - overdue: عقب‌افتاده
        - due_today: امروز موعده
        - due_tomorrow: فردا موعده
        - ok: همه‌چیز خوبه
        - unknown: اطلاعاتی ثبت نشده
        """
        if not self.tuition_day or not self.last_payment_date:
            return {
                'status': 'unknown',
                'days_remaining': None,
                'days_overdue': None,
                'next_due_date': None,
            }
        
        try:
            # آخرین پرداخت
            last = jdatetime.date.fromisoformat(self.last_payment_date.replace('/', '-'))
            
            # سررسید بعدی
            if last.month == 12:
                next_due = jdatetime.date(last.year + 1, 1, self.tuition_day)
            else:
                next_due = jdatetime.date(last.year, last.month + 1, self.tuition_day)
            
            today = jdatetime.date.today()
            diff = (next_due - today).days
            
            next_due_str = next_due.strftime('%Y/%m/%d')
            
            if diff < 0:
                return {
                    'status': 'overdue',
                    'days_remaining': None,
                    'days_overdue': abs(diff),
                    'next_due_date': next_due_str,
                }
            elif diff == 0:
                return {
                    'status': 'due_today',
                    'days_remaining': 0,
                    'days_overdue': None,
                    'next_due_date': next_due_str,
                }
            elif diff == 1:
                return {
                    'status': 'due_tomorrow',
                    'days_remaining': 1,
                    'days_overdue': None,
                    'next_due_date': next_due_str,
                }
            else:
                return {
                    'status': 'ok',
                    'days_remaining': diff,
                    'days_overdue': None,
                    'next_due_date': next_due_str,
                }
        except:
            return {
                'status': 'unknown',
                'days_remaining': None,
                'days_overdue': None,
                'next_due_date': None,
            }