from django.db import models
from django.conf import settings
from core.models import Grade, FieldOfStudy, Course

User = settings.AUTH_USER_MODEL


class Video(models.Model):
    """ویدیوهای آموزشی - مشاور برای همه دانش‌آموزان خودش"""
    
    title = models.CharField(max_length=200, verbose_name="عنوان ویدیو")
    description = models.TextField(null=True, blank=True, verbose_name="توضیحات")
    video_file = models.FileField(
        upload_to='videos/',
        null=True,
        blank=True,
        verbose_name="فایل ویدیو"
    )
    aparat_link = models.URLField(
        null=True,
        blank=True,
        verbose_name="لینک آپارات"
    )
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='videos',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    thumbnail = models.ImageField(
        upload_to='education/videos/thumbnails/',
        null=True, blank=True,
        verbose_name="تصویر پیش‌نمایش ویدیو"
    )
    
    class Meta:
        verbose_name = "ویدیو"
        verbose_name_plural = "ویدیوها"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.counselor}"
    
    @property
    def has_video(self):
        """آیا حداقل یکی از فایل یا لینک آپارات وجود داره؟"""
        return bool(self.video_file or self.aparat_link)


class Podcast(models.Model):
    """پادکست‌های آموزشی"""
    
    title = models.CharField(max_length=200, verbose_name="عنوان پادکست")
    description = models.TextField(null=True, blank=True, verbose_name="توضیحات")
    audio_file = models.FileField(upload_to='podcasts/', verbose_name="فایل صوتی")
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='podcasts',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    cover_image = models.ImageField(
        upload_to='education/podcasts/covers/',
        null=True, blank=True,
        verbose_name="تصویر جلد پادکست"
    )
    
    class Meta:
        verbose_name = "پادکست"
        verbose_name_plural = "پادکست‌ها"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.counselor}"


class Note(models.Model):
    """جزوه‌های درسی - با فیلتر رشته و پایه و درس"""
    
    title = models.CharField(max_length=200, verbose_name="عنوان جزوه")
    description = models.TextField(null=True, blank=True, verbose_name="توضیحات")
    pdf_file = models.FileField(upload_to='notes/', verbose_name="فایل PDF")
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name="درس"
    )
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='notes',
        verbose_name="پایه تحصیلی"
    )
    field_of_study = models.ManyToManyField(  # ← اینو عوض کن
        FieldOfStudy,
        related_name='notes',
        blank=True,
        verbose_name="رشته‌های تحصیلی"
    )
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    cover_image = models.ImageField(
        upload_to='education/notes/covers/',
        null=True, blank=True,
        verbose_name="تصویر جلد جزوه"
    )
    
    class Meta:
        verbose_name = "جزوه"
        verbose_name_plural = "جزوه‌ها"
        ordering = ['-created_at']
    
    def __str__(self):
        fields = ", ".join([f.name for f in self.field_of_study.all()])
        return f"{self.title} - {self.course} ({fields})"


class ExamSample(models.Model):
    """نمونه سوالات - با فیلتر رشته و پایه و درس"""
    
    title = models.CharField(max_length=200, verbose_name="عنوان نمونه سوال")
    description = models.TextField(null=True, blank=True, verbose_name="توضیحات")
    pdf_file = models.FileField(upload_to='exam_samples/', verbose_name="فایل PDF")
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='exam_samples',
        verbose_name="درس"
    )
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='exam_samples',
        verbose_name="پایه تحصیلی"
    )
    field_of_study = models.ManyToManyField(  # ← اینو عوض کن
        FieldOfStudy,
        related_name='exam_samples',
        blank=True,
        verbose_name="رشته‌های تحصیلی"
    )
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exam_samples',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")

    cover_image = models.ImageField(
        upload_to='education/samples/covers/',
        null=True, blank=True,
        verbose_name="تصویر نمونه سوال"
    )
    
    class Meta:
        verbose_name = "نمونه سوال"
        verbose_name_plural = "نمونه سوالات"
        ordering = ['-created_at']
    
    def __str__(self):
        fields = ", ".join([f.name for f in self.field_of_study.all()])
        return f"{self.title} - {self.course} ({fields})"