from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class VesselTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vessel_id = models.CharField(max_length=50, db_index=True)
    mmsi = models.CharField(max_length=9, blank=True, null=True, db_index=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    latitude = models.FloatField(
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )
    longitude = models.FloatField(
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )
    speed = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0.0)]
    )
    course = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(360.0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vessel_tracks'
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['mmsi']),
            models.Index(fields=['vessel_id']),
            models.Index(fields=['timestamp']),
        ]
        ordering = ['-timestamp']

    def __str__(self):
        return f"Vessel {self.vessel_id} at {self.timestamp}"

    def save(self, *args, **kwargs):
        # Ensure MMSI is properly formatted if provided
        if self.mmsi:
            self.mmsi = str(self.mmsi).zfill(9)
        super().save(*args, **kwargs)

class UserPrediction(models.Model):
    PREDICTION_TYPES = [
        ('ais', 'AIS Behavior'),
        ('fishing', 'Fishing Detection'),
        ('kattegat', 'Kattegat Region'),
        ('violation', 'Violation Detection'),
        ('anomaly', 'Anomaly Detection'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vessel_track = models.ForeignKey(VesselTrack, on_delete=models.CASCADE)
    model_type = models.CharField(max_length=50, choices=PREDICTION_TYPES)
    prediction_time = models.DateTimeField(default=timezone.now)
    prediction_result = models.JSONField(default=dict)
    confidence = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_predictions'
        indexes = [
            models.Index(fields=['user', '-prediction_time']),
            models.Index(fields=['model_type']),
            models.Index(fields=['vessel_track']),
            models.Index(fields=['is_active']),
        ]
        ordering = ['-prediction_time']

    def __str__(self):
        return f"{self.model_type} prediction for {self.vessel_track}"

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_start = models.DateTimeField(default=timezone.now)
    session_end = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_sessions'
        indexes = [
            models.Index(fields=['user', '-session_start']),
            models.Index(fields=['is_active']),
            models.Index(fields=['last_activity']),
        ]
        ordering = ['-session_start']

    def __str__(self):
        return f"Session for {self.user} started at {self.session_start}"

    def end_session(self):
        """End the current session"""
        self.session_end = timezone.now()
        self.is_active = False
        self.save()

    @property
    def duration(self):
        """Get session duration"""
        if self.session_end:
            return self.session_end - self.session_start
        return timezone.now() - self.session_start

class VesselAlert(models.Model):
    ALERT_TYPES = [
        ('speed', 'Speed Violation'),
        ('zone', 'Restricted Zone'),
        ('behavior', 'Suspicious Behavior'),
        ('missing', 'Missing Signal'),
        ('collision', 'Collision Risk'),
    ]

    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    vessel_track = models.ForeignKey(VesselTrack, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'vessel_alerts'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['vessel_track']),
            models.Index(fields=['alert_type']),
            models.Index(fields=['severity']),
            models.Index(fields=['acknowledged']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.alert_type} alert for {self.vessel_track}"

    def acknowledge(self):
        """Acknowledge the alert"""
        self.acknowledged = True
        self.acknowledged_at = timezone.now()
        self.save()

    def resolve(self):
        """Resolve the alert"""
        self.resolved = True
        self.resolved_at = timezone.now()
        self.save()