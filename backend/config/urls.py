from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/core/', include('core.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/counseling/', include('counseling.urls')),
    path('api/education/', include('education.urls')),
    path('api/exam/', include('exam.urls')),
    path('api/psychology/', include('psychology.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/student/', include('student_panel.urls')),  # ← اینو اضافه کن
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)