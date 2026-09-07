from django.db import models
from django.conf import settings
from django_jalali.db import models as jmodels  

User = settings.AUTH_USER_MODEL


class StudyPlan(models.Model):
    """برنامه‌ای که مشاور برای دانش‌آموز می‌ذاره"""
    
    STATUS_CHOICES = [
        ('pending', 'در انتظار'),
        ('done', 'انجام شده'),
        ('missed', 'انجام نشده'),
    ]
    
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='given_plans',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='study_plans',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    plan_date = models.CharField(max_length=20, verbose_name="تاریخ برنامه")

    course = models.ForeignKey(
        'core.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='study_plans',
        verbose_name="درس (انتخاب از لیست)"
    )
    
    course_name = models.CharField(max_length=100, verbose_name="نام درس")
    study_time = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="زمان مطالعه (اختیاری)"
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name="توضیحات (اختیاری)"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="وضعیت"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "برنامه درسی"
        verbose_name_plural = "برنامه‌های درسی"
        ordering = ['-plan_date', '-created_at']
    
    def __str__(self):
        return f"{self.student} - {self.course_name} ({self.plan_date})"


class Report(models.Model):
    """گزارش روزانه دانش‌آموز به مشاور"""
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reports',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_reports',
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    report_date = models.CharField(max_length=20, verbose_name="روز و تاریخ")
    course = models.ForeignKey(
        'core.Course',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports',
        verbose_name="درس (انتخاب از لیست)"
    )
    course_name = models.CharField(max_length=100, verbose_name="نام درس")
    study_time = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        verbose_name="زمان مطالعه (ساعت)"
    )
    correct_answers = models.PositiveIntegerField(default=0, verbose_name="تعداد تست درست")
    wrong_answers = models.PositiveIntegerField(default=0, verbose_name="تعداد تست غلط")
    unanswered = models.PositiveIntegerField(default=0, verbose_name="تعداد تست نزده")
    test_time = models.PositiveIntegerField(
        default=0,
        verbose_name="زمان تست (دقیقه)"
    )
    topic = models.CharField(max_length=200, verbose_name="مبحث مورد مطالعه")
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name="توضیحات (اختیاری)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "گزارش کار"
        verbose_name_plural = "گزارش‌های کار"
        ordering = ['-report_date', '-created_at']
    
    def __str__(self):
        return f"گزارش {self.student} - {self.course_name} ({self.report_date})"
    
    # ===== فیلدهای محاسباتی =====
    
    @property
    def total_questions(self):
        """کل تست‌ها = درست + غلط + نزده"""
        return self.correct_answers + self.wrong_answers + self.unanswered
    
    @property
    def percentage(self):
        """
        درصد = (تعداد درست × 3 - تعداد غلط) / (کل × 3) × 100
        """
        total = self.total_questions
        if total == 0:
            return 0
        return round(
            ((self.correct_answers * 3 - self.wrong_answers) / (total * 3)) * 100,
            2
        )


# ===== مدل هدف‌گذاری =====

class Goal(models.Model):
    """اهداف هفتگی دانش‌آموز"""
    
    TARGET_TYPES = [
        ('study_hours', 'ساعت مطالعه'),
        ('tests', 'تعداد تست'),
        ('lessons', 'تعداد درس'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='goals',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    title = models.CharField(max_length=200, verbose_name="عنوان هدف")
    description = models.TextField(
        null=True, blank=True,
        verbose_name="توضیحات"
    )
    target_type = models.CharField(
        max_length=20,
        choices=TARGET_TYPES,
        default='study_hours',
        verbose_name="نوع هدف"
    )
    target_value = models.PositiveIntegerField(
        default=20,
        verbose_name="مقدار هدف (ساعت/تعداد)"
    )
    current_value = models.PositiveIntegerField(
        default=0,
        verbose_name="پیشرفت فعلی"
    )
    start_date = models.CharField(
        max_length=20,
        verbose_name="تاریخ شروع"
    )
    end_date = models.CharField(
        max_length=20,
        verbose_name="تاریخ پایان"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="فعال"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "هدف"
        verbose_name_plural = "اهداف"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student} - {self.title}"
    
    @property
    def progress_percentage(self):
        """درصد پیشرفت"""
        if self.target_value == 0:
            return 0
        return min(round((self.current_value / self.target_value) * 100), 100)
    
    @property
    def days_remaining(self):
        """روزهای باقی‌مونده"""
        try:
            from datetime import date
            end = date.fromisoformat(self.end_date.replace('/', '-'))
            today = date.today()
            delta = (end - today).days
            return max(delta, 0)
        except:
            return 0


# ===== To-Do List شخصی دانش‌آموز =====

class StudentTodo(models.Model):
    """تسک‌های شخصی دانش‌آموز (غیر از برنامه مشاور)"""
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='todos',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    title = models.CharField(max_length=200, verbose_name="عنوان تسک")
    date = models.CharField(max_length=20, verbose_name="تاریخ")
    is_done = models.BooleanField(default=False, verbose_name="انجام شده")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "تسک شخصی"
        verbose_name_plural = "تسک‌های شخصی"
        ordering = ['date', '-created_at']
    
    def __str__(self):
        return f"{self.student} - {self.title}"


# ===== جملات انگیزشی =====

class MotivationalQuote(models.Model):
    """جملات انگیزشی روزانه"""
    
    quote = models.TextField(verbose_name="جمله انگیزشی")
    author = models.CharField(max_length=100, null=True, blank=True, verbose_name="نویسنده")
    day_of_year = models.PositiveIntegerField(unique=True, verbose_name="روز سال (۱ تا ۳۶۵)")
    
    class Meta:
        verbose_name = "جمله انگیزشی"
        verbose_name_plural = "جملات انگیزشی"
        ordering = ['day_of_year']
    
    def __str__(self):
        return f"روز {self.day_of_year}: {self.quote[:50]}..."


# ===== هدف‌گذاری (ساده و مفهوم) =====

class StudentGoal(models.Model):
    """اهداف شخصی دانش‌آموز"""
    
    GOAL_TYPES = [
        ('study_hours', '📚 ساعت مطالعه'),
        ('tests', '📝 تعداد تست'),
        ('lessons', '📖 تعداد درس'),
        ('exercise', '🏃 ورزش'),
        ('meditation', '🧘 مدیتیشن'),
        ('reading', '📕 کتاب‌خوانی'),
        ('custom', '✨ شخصی‌سازی'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='student_goals',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    title = models.CharField(max_length=200, verbose_name="عنوان هدف")
    goal_type = models.CharField(
        max_length=20,
        choices=GOAL_TYPES,
        default='study_hours',
        verbose_name="نوع هدف"
    )
    target_value = models.PositiveIntegerField(default=20, verbose_name="مقدار هدف")
    current_value = models.PositiveIntegerField(default=0, verbose_name="پیشرفت فعلی")
    start_date = models.CharField(max_length=20, verbose_name="تاریخ شروع")
    end_date = models.CharField(max_length=20, verbose_name="تاریخ پایان")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "هدف"
        verbose_name_plural = "اهداف"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student} - {self.title}"
    
    @property
    def progress_percentage(self):
        if self.target_value == 0:
            return 0
        return min(round((self.current_value / self.target_value) * 100), 100)
    
    @property
    def days_remaining(self):
        try:
            from datetime import datetime
            end = datetime.strptime(self.end_date.replace('/', '-'), '%Y-%m-%d').date()
            today = datetime.now().date()
            delta = (end - today).days
            return max(delta, 0)
        except:
            return 0


class ContactLog(models.Model):
    """لاگ تماس‌های مشاور با دانش‌آموز"""
    
    CONTACT_TYPES = [
        ('call', 'تماس تلفنی'),
        ('text', 'پیامک'),
        ('video', 'تماس ویدیویی'),
    ]
    
    counselor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='counselor_contact_logs',  
        limit_choices_to={'role': 'counselor'},
        verbose_name="مشاور"
    )
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='student_contact_logs',
        limit_choices_to={'role': 'student'},
        verbose_name="دانش‌آموز"
    )
    contact_date = models.CharField(max_length=20, verbose_name="تاریخ تماس")
    contact_type = models.CharField(
        max_length=10,
        choices=CONTACT_TYPES,
        default='call',
        verbose_name="نوع تماس"
    )
    note = models.TextField(null=True, blank=True, verbose_name="یادداشت")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "لاگ تماس"
        verbose_name_plural = "لاگ تماس‌ها"
        ordering = ['-contact_date', '-created_at']
    
    def __str__(self):
        return f"{self.counselor} → {self.student} ({self.contact_date})"