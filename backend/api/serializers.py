from rest_framework import serializers
from django.contrib.auth.models import User
from .models import VesselTrack, UserPrediction, UserSession

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'last_login')
        read_only_fields = ('last_login',)

class VesselTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = VesselTrack
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class PredictionHistorySerializer(serializers.ModelSerializer):
    vessel_track = VesselTrackSerializer()
    
    class Meta:
        model = UserPrediction
        fields = '__all__'
        read_only_fields = ('user', 'prediction_time')

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'
        read_only_fields = ('user', 'session_start')