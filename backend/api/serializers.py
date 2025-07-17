from rest_framework import serializers
from django.contrib.auth.models import User
from .models import VesselTrack, UserPrediction, UserSession, VesselAlert

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'last_login', 'date_joined')
        read_only_fields = ('last_login', 'date_joined')
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class VesselTrackSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = VesselTrack
        fields = '__all__'
        read_only_fields = ('user', 'created_at')
    
    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90")
        return value
    
    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180")
        return value
    
    def validate_speed(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Speed cannot be negative")
        return value
    
    def validate_course(self, value):
        if value is not None and not 0 <= value <= 360:
            raise serializers.ValidationError("Course must be between 0 and 360")
        return value

class UserPredictionSerializer(serializers.ModelSerializer):
    vessel_track = VesselTrackSerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    model_type_display = serializers.CharField(source='get_model_type_display', read_only=True)
    
    class Meta:
        model = UserPrediction
        fields = '__all__'
        read_only_fields = ('user', 'prediction_time')

class PredictionHistorySerializer(serializers.ModelSerializer):
    vessel_track = VesselTrackSerializer(read_only=True)
    model_type_display = serializers.CharField(source='get_model_type_display', read_only=True)
    
    class Meta:
        model = UserPrediction
        fields = '__all__'
        read_only_fields = ('user', 'prediction_time')

class UserSessionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = UserSession
        fields = '__all__'
        read_only_fields = ('user', 'session_start', 'last_activity')
    
    def get_duration(self, obj):
        duration = obj.duration
        if duration:
            total_seconds = int(duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return "0h 0m"

class VesselAlertSerializer(serializers.ModelSerializer):
    vessel_track = VesselTrackSerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = VesselAlert
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'acknowledged_at', 'resolved_at')

class VesselTrackCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vessel tracks"""
    
    class Meta:
        model = VesselTrack
        fields = ('vessel_id', 'mmsi', 'timestamp', 'latitude', 'longitude', 'speed', 'course')
    
    def validate_mmsi(self, value):
        if value and len(value) > 9:
            raise serializers.ValidationError("MMSI must be 9 digits or less")
        return value

class PredictionRequestSerializer(serializers.Serializer):
    """Serializer for prediction requests"""
    data = serializers.JSONField()
    model_type = serializers.ChoiceField(
        choices=UserPrediction.PREDICTION_TYPES,
        default='ais'
    )
    
    def validate_data(self, value):
        if isinstance(value, list):
            for item in value:
                if not isinstance(item, dict):
                    raise serializers.ValidationError("Each item in data must be a dictionary")
                required_fields = ['vessel_id', 'latitude', 'longitude']
                for field in required_fields:
                    if field not in item:
                        raise serializers.ValidationError(f"Missing required field: {field}")
        elif isinstance(value, dict):
            required_fields = ['vessel_id', 'latitude', 'longitude']
            for field in required_fields:
                if field not in value:
                    raise serializers.ValidationError(f"Missing required field: {field}")
        else:
            raise serializers.ValidationError("Data must be a dictionary or list of dictionaries")
        
        return value

class ViolationCheckSerializer(serializers.Serializer):
    """Serializer for violation check requests"""
    vessel_data = serializers.JSONField()
    
    def validate_vessel_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Vessel data must be a dictionary")
        
        required_fields = ['vessel_id', 'latitude', 'longitude']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        
        return value