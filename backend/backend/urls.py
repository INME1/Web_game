from django.contrib import admin
from django.urls import path, include
from django.conf import settings  # ⭐ 추가
from django.conf.urls.static import static  # ⭐ 추가
import os  # ⭐ 추가

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('poker_api.urls')),  # 너의 API 연결
]

# ⭐ static 파일 서빙
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=os.path.join(settings.BASE_DIR, 'static'))
