from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    CurrentUserView,
    ModelStatusView,
    PredictionView,
    PredictionHistoryView,
    ViolationCheckView
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('model-status/', ModelStatusView.as_view(), name='model-status'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('predictions/history/', PredictionHistoryView.as_view(), name='prediction-history'),
    path('violation-check/', ViolationCheckView.as_view(), name='violation-check'),
]