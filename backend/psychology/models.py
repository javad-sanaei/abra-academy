from django.db import models
from django.conf import settings
from django_jalali.db import models as jmodels

User = settings.AUTH_USER_MODEL


class PsychologyRequest(models.Model):
    """درخواست مشاوره روانشناسی"""
    
    URGENCY_CHOICES = [
        ('low', 'کم'),
        ('medium', 'متوسط'),
        ('high', 'زیاد'),
        ('emergency', 'اورژانسی'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'در انتظار'),
        ('reviewing', 'در حال بررسی'),
        ('contacted', 'تماس گرفته شده'),
        ('resolved', 'حل شده'),
        ('cancelled', 'لغو شده'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='psychology_requests',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    psychologist = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_requests',
        limit_choices_to={'role': 'psychologist'},
        verbose_name="روانشناس"
    )
    subject = models.CharField(max_length=200, verbose_name="موضوع")
    description = models.TextField(verbose_name="توضیحات")
    urgency = models.CharField(
        max_length=10,
        choices=URGENCY_CHOICES,
        default='medium',
        verbose_name="میزان فوریت"
    )
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="وضعیت"
    )
    psychologist_note = models.TextField(
        null=True,
        blank=True,
        verbose_name="یادداشت روانشناس"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ثبت")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="آخرین بروزرسانی")
    
    class Meta:
        verbose_name = "درخواست روانشناسی"
        verbose_name_plural = "درخواست‌های روانشناسی"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student} - {self.subject} ({self.get_status_display()})"