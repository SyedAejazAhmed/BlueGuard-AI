from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    ModelStatusView,
    PredictionView,
    PredictionHistoryView,
    ViolationCheckView,
    VesselTrackingView,
    UserSessionView,
    AlertsView,
    HealthCheckView
)

urlpatterns = [
    # Authentication
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    
    # Core functionality
    path('model-status/', ModelStatusView.as_view(), name='model-status'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('predictions/history/', PredictionHistoryView.as_view(), name='prediction-history'),
    path('violation-check/', ViolationCheckView.as_view(), name='violation-check'),
    
    # Vessel tracking
    path('vessels/tracks/', VesselTrackingView.as_view(), name='vessel-tracks'),
    
    # User management
    path('sessions/', UserSessionView.as_view(), name='user-sessions'),
    path('alerts/', AlertsView.as_view(), name='alerts'),
    
    # Health check
    path('health/', HealthCheckView.as_view(), name='health-check'),
]