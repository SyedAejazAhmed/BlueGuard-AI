from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class VesselTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vessel_id = models.CharField(max_length=50)
    mmsi = models.CharField(max_length=9, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True, blank=True)
    course = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vessel_tracks'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['mmsi']),
        ]

    def __str__(self):
        return f"Vessel {self.vessel_id} at {self.timestamp}"

class UserPrediction(models.Model):
    PREDICTION_TYPES = [
        ('ais', 'AIS Behavior'),
        ('fishing', 'Fishing Detection'),
        ('kattegat', 'Kattegat Region')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vessel_track = models.ForeignKey(VesselTrack, on_delete=models.CASCADE)
    model_type = models.CharField(max_length=50, choices=PREDICTION_TYPES)
    prediction_time = models.DateTimeField(default=timezone.now)
    prediction_result = models.JSONField()
    confidence = models.FloatField(default=0.0)

    class Meta:
        db_table = 'user_predictions'
        indexes = [
            models.Index(fields=['user', '-prediction_time']),
        ]

    def __str__(self):
        return f"{self.model_type} prediction for {self.vessel_track}"

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_start = models.DateTimeField(default=timezone.now)
    session_end = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = 'user_sessions'
        indexes = [
            models.Index(fields=['user', '-session_start']),
        ]

    def __str__(self):
        return f"Session for {self.user} started at {self.session_start}"