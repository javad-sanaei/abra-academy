from django.db import models


class Grade(models.Model):
    """
    پایه‌های تحصیلی: دهم، یازدهم، دوازدهم، ...
    """
    name = models.CharField(max_length=50, unique=True, verbose_name="نام پایه")
    order = models.PositiveSmallIntegerField(default=1, verbose_name="ترتیب")
    
    class Meta:
        verbose_name = "پایه تحصیلی"
        verbose_name_plural = "پایه‌های تحصیلی"
        ordering = ['order']
    
    def __str__(self):
        return self.name


class FieldOfStudy(models.Model):
    """
    رشته‌های تحصیلی: تجربی، ریاضی، انسانی، ...
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="نام رشته")
    
    class Meta:
        verbose_name = "رشته تحصیلی"
        verbose_name_plural = "رشته‌های تحصیلی"
    
    def __str__(self):
        return self.name


class Course(models.Model):
    """
    درس‌ها: ریاضی، فیزیک، زیست، ...
    """
    name = models.CharField(max_length=100, verbose_name="نام درس")
    field_of_study = models.ManyToManyField(
        FieldOfStudy,
        related_name='courses',
        blank=True,
        verbose_name="رشته‌های مربوطه"
    )
    grade = models.ForeignKey(
        Grade,
        on_delete=models.CASCADE,
        related_name='courses',
        null=True,
        blank=True,
        verbose_name="پایه مربوطه"
    )
    
    # ===== فقط تصویر درس =====
    image = models.ImageField(
        upload_to='subjects/',
        null=True,
        blank=True,
        verbose_name="تصویر درس"
    )
    # ==========================
    
    class Meta:
        verbose_name = "درس"
        verbose_name_plural = "درس‌ها"
    
    def __str__(self):
        fields = ", ".join([f.name for f in self.field_of_study.all()])
        if fields:
            return f"{self.name} ({self.grade} - {fields})"
        return f"{self.name} ({self.grade})"