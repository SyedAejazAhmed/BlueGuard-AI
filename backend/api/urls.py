from django.urls import path
from .views import (
    PredictionView,
    ViolationCheckView,
    ZonesView,
    ModelStatusView
)

urlpatterns = [
    path('predict/', PredictionView.as_view(), name='predict'),
    path('violation-check/', ViolationCheckView.as_view(), name='violation-check'),
    path('zones/', ZonesView.as_view(), name='zones'),
    path('model-status/', ModelStatusView.as_view(), name='model-status'),
]