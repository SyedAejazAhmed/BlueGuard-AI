from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import HttpResponse
from rest_framework.authtoken import views

def health_check(request):
    """Simple health check endpoint"""
    return HttpResponse("OK", content_type="text/plain")

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('api.urls')),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token-auth/', views.obtain_auth_token),
    
    # Health check
    path('health/', health_check, name='health-check'),
    
    # Serve React app (for production)
    # re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='frontend'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)