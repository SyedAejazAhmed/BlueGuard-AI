from djongo import models

class VesselTrack(models.Model):
    vessel_id = models.CharField(max_length=50)
    mmsi = models.CharField(max_length=9)
    timestamp = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField(null=True)
    course = models.FloatField(null=True)
    prediction = models.JSONField(null=True)
    
    class Meta:
        db_table = 'vessel_tracks'

class ZoneViolation(models.Model):
    vessel_id = models.CharField(max_length=50)
    zone_type = models.CharField(max_length=50)
    violation_time = models.DateTimeField()
    location = models.JSONField()
    details = models.JSONField(null=True)
    
    class Meta:
        db_table = 'zone_violations'