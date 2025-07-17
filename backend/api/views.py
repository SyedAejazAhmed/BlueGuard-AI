from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import VesselTrack, ZoneViolation
from datetime import datetime

class PredictionView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Create vessel track record
            track = VesselTrack.objects.create(
                vessel_id=data.get('vessel_id'),
                mmsi=data.get('mmsi'),
                timestamp=datetime.now(),
                latitude=data.get('latitude'),
                longitude=data.get('longitude'),
                speed=data.get('speed'),
                course=data.get('course'),
                prediction={
                    'class': 'fishing',
                    'confidence': 0.95
                }
            )
            
            return Response({
                'id': str(track.id),
                'prediction': track.prediction
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ViolationCheckView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Create violation record
            violation = ZoneViolation.objects.create(
                vessel_id=data.get('vessel_id'),
                zone_type='MPA',
                violation_time=datetime.now(),
                location={
                    'lat': data.get('latitude'),
                    'lon': data.get('longitude')
                },
                details={
                    'zone_name': 'Protected Area 1',
                    'severity': 'high'
                }
            )
            
            return Response({
                'id': str(violation.id),
                'violation_detected': True,
                'details': violation.details
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )