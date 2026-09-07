from django.db import models
from django.conf import settings
from django_jalali.db import models as jmodels

User = settings.AUTH_USER_MODEL


class Exam(models.Model):
    """آزمون - ساخته شده توسط مشاور برای همه دانش‌آموزانش"""
    
    EXAM_TYPE_CHOICES = [
        ('test', 'فقط تستی'),
        ('mixed', 'تستی و تشریحی'),
    ]

    SCORE_TYPE_CHOICES = [
        ('percentage', 'درصد'),
        ('score', 'نمره'),
    ]
    
    
    title = models.CharField(max_length=200, verbose_name="عنوان آزمون")
    exam_type = models.CharField(
        max_length=10,
        choices=EXAM_TYPE_CHOICES,
        default='test',
        verbose_name="نوع آزمون"
    )
    score_type = models.CharField(
            max_length=10,
            choices=SCORE_TYPE_CHOICES,
            default='percentage',
            verbose_name="نوع نمره‌دهی"
        )
    duration = models.PositiveIntegerField(verbose_name="مدت زمان (دقیقه)")
    entry_start = jmodels.jDateTimeField(verbose_name="تاریخ و ساعت شروع")
    entry_end = jmodels.jDateTimeField(verbose_name="تاریخ و ساعت پایان")
    description = models.TextField(null=True, blank=True, verbose_name="توضیحات")
    file = models.FileField(
        upload_to='exams/',
        null=True,
        blank=True,
        verbose_name="فایل پیوست"
    )
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exams',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )

    motivation_text = models.TextField(
        null=True, blank=True,
        verbose_name="جمله انگیزشی قبل از آزمون"
    )
    advice_text = models.TextField(
        null=True, blank=True,
        verbose_name="نصیحت مشاور"
    )
    
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "آزمون"
        verbose_name_plural = "آزمون‌ها"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.counselor}"


class ExamSection(models.Model):
    """بخش‌های یک آزمون (مثلاً حسابان ۱، فیزیک ۳)"""
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='sections',
        verbose_name="آزمون"
    )
    title = models.CharField(max_length=100, verbose_name="عنوان بخش")
    course = models.ForeignKey(
        'core.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="درس مرتبط"
    )
    order = models.PositiveIntegerField(default=1, verbose_name="ترتیب")
    
    class Meta:
        verbose_name = "بخش آزمون"
        verbose_name_plural = "بخش‌های آزمون"
        ordering = ['order']
    
    def __str__(self):
        return f"{self.exam.title} - {self.title}"


class Question(models.Model):
    """سوال‌های یک آزمون"""
    
    QUESTION_TYPE_CHOICES = [
        ('test', 'تستی'),
        ('essay', 'تشریحی'),
    ]
    
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name="آزمون"
    )

    section = models.ForeignKey(  # ← اضافه کن
        ExamSection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='questions',
        verbose_name="بخش"
    )

    question_type = models.CharField(
        max_length=10,
        choices=QUESTION_TYPE_CHOICES,
        default='test',
        verbose_name="نوع سوال"
    )
    text = models.TextField(null=True, blank=True, verbose_name="متن سوال")
    image = models.ImageField(
        upload_to='questions/',
        null=True,
        blank=True,
        verbose_name="تصویر سوال"
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1,
        verbose_name="نمره سوال"
    )
    order = models.PositiveIntegerField(default=1, verbose_name="ترتیب")
    
    class Meta:
        verbose_name = "سوال"
        verbose_name_plural = "سوالات"
        ordering = ['order']
        unique_together = ['exam', 'order']
    
    def __str__(self):
        preview = self.text[:50] if self.text else "(تصویر)"
        return f"سوال {self.order}: {preview}"
    
    def clean(self):
        """حداقل یکی از متن یا عکس باید باشه"""
        if not self.text and not self.image:
            from django.core.exceptions import ValidationError
            raise ValidationError('حداقل متن یا تصویر سوال باید وارد شود.')


class Choice(models.Model):
    """گزینه‌های سوالات تستی"""
    
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='choices',
        limit_choices_to={'question_type': 'test'},
        verbose_name="سوال"
    )
    text = models.CharField(max_length=300, verbose_name="متن گزینه")
    is_correct = models.BooleanField(default=False, verbose_name="گزینه صحیح")
    order = models.PositiveSmallIntegerField(default=1, verbose_name="شماره گزینه")
    
    class Meta:
        verbose_name = "گزینه"
        verbose_name_plural = "گزینه‌ها"
        ordering = ['order']
    
    def __str__(self):
        return f"گزینه {self.order}: {self.text[:40]}"


class ExamResponse(models.Model):
    """ثبت شرکت دانش‌آموز در آزمون"""
    
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name="آزمون"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='exam_responses',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    started_at = models.DateTimeField(null=True, blank=True, verbose_name="زمان شروع")
    finished_at = models.DateTimeField(null=True, blank=True, verbose_name="زمان پایان")
    total_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="نمره کل"
    )
    exit_count = models.PositiveIntegerField(default=0, verbose_name="تعداد خروج")
    
    class Meta:
        verbose_name = "پاسخنامه"
        verbose_name_plural = "پاسخنامه‌ها"
        unique_together = ['exam', 'student']
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.student} - {self.exam.title}"
    
    @property
    def is_finished(self):
        return self.finished_at is not None


class TestAnswer(models.Model):
    """پاسخ‌های تستی دانش‌آموز"""
    
    response = models.ForeignKey(
        ExamResponse,
        on_delete=models.CASCADE,
        related_name='test_answers',
        verbose_name="پاسخنامه"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        limit_choices_to={'question_type': 'test'},
        verbose_name="سوال"
    )
    choice = models.ForeignKey(
        Choice,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="گزینه انتخاب شده"
    )
    
    class Meta:
        verbose_name = "پاسخ تستی"
        verbose_name_plural = "پاسخ‌های تستی"
        unique_together = ['response', 'question']
    
    def __str__(self):
        return f"{self.response.student} - {self.question}"
    
    @property
    def is_correct(self):
        return self.choice and self.choice.is_correct


class EssayAnswer(models.Model):
    """پاسخ‌های تشریحی دانش‌آموز"""
    
    response = models.ForeignKey(
        ExamResponse,
        on_delete=models.CASCADE,
        related_name='essay_answers',
        verbose_name="پاسخنامه"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        limit_choices_to={'question_type': 'essay'},
        verbose_name="سوال"
    )
    text_answer = models.TextField(null=True, blank=True, verbose_name="پاسخ متنی")
    file_answer = models.FileField(
        upload_to='essay_answers/',
        null=True,
        blank=True,
        verbose_name="فایل پاسخ"
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="نمره داده شده توسط مشاور"
    )
    
    class Meta:
        verbose_name = "پاسخ تشریحی"
        verbose_name_plural = "پاسخ‌های تشریحی"
        unique_together = ['response', 'question']
    
    def __str__(self):
        return f"{self.response.student} - {self.question}"