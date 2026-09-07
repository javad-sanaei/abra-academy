from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Comment(models.Model):
    COMMENT_TYPES = [
        ('general', 'عمومی'),
        ('course', 'دوره آموزشی'),
        ('counselor', 'مشاور'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="کاربر"
    )
    comment_type = models.CharField(
        max_length=20,
        choices=COMMENT_TYPES,
        default='general',
        verbose_name="نوع کامنت"
    )
    related_object_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="شناسه مرتبط"
    )
    content = models.TextField(verbose_name="متن کامنت")
    rating = models.PositiveSmallIntegerField(
        default=5,
        verbose_name="امتیاز (۱ تا ۵)"
    )
    is_active = models.BooleanField(
        default=False,
        verbose_name="تأیید شده"
    )
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name="پاسخ به"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="تاریخ ثبت"
    )
    
    class Meta:
        verbose_name = "کامنت"
        verbose_name_plural = "کامنت‌ها"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user} - {self.content[:50]}..."