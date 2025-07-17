from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from .models import User, VesselTrack, UserPrediction
from .serializers import UserSerializer, PredictionHistorySerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            user.last_login = timezone.now()
            user.save()
            
            return Response({
                'user': UserSerializer(user).data,
                'token': 'session-based-auth'  # Using session auth
            })
        
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class ModelStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Check availability of different model types
            model_status = {
                'ais': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0'
                },
                'fishing': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0'
                },
                'kattegat': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0'
                }
            }
            
            return Response({
                'status': model_status,
                'timestamp': timezone.now().isoformat(),
                'user': request.user.username
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PredictionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data.get('data')
            model_type = request.data.get('model_type', 'ais')
            
            # Create vessel track
            if isinstance(data, list):
                tracks = []
                predictions = []
                
                for vessel_data in data:
                    track = VesselTrack.objects.create(
                        user=request.user,
                        **vessel_data
                    )
                    tracks.append(track)
                    
                    # Get prediction for each vessel
                    prediction = self._get_prediction(vessel_data, model_type)
                    predictions.append(prediction)
                    
                    # Store user prediction
                    UserPrediction.objects.create(
                        user=request.user,
                        vessel_track=track,
                        model_type=model_type,
                        prediction_result=prediction
                    )
                
                return Response({
                    'predictions': predictions,
                    'track_ids': [t.id for t in tracks],
                    'timestamp': timezone.now().isoformat()
                })
            
            else:
                track = VesselTrack.objects.create(
                    user=request.user,
                    **data
                )
                
                prediction = self._get_prediction(data, model_type)
                
                UserPrediction.objects.create(
                    user=request.user,
                    vessel_track=track,
                    model_type=model_type,
                    prediction_result=prediction
                )
                
                return Response({
                    'prediction': prediction,
                    'track_id': track.id,
                    'timestamp': timezone.now().isoformat()
                })
                
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _get_prediction(self, data, model_type):
        # Implement prediction logic based on model type
        if model_type == 'ais':
            return {
                'behavior': 'normal',
                'confidence': 0.95,
                'risk_level': 'low',
                'prediction_time': timezone.now().isoformat()
            }
        elif model_type == 'fishing':
            return {
                'behavior': 'fishing',
                'confidence': 0.85,
                'risk_level': 'medium',
                'prediction_time': timezone.now().isoformat()
            }
        else:
            return {
                'behavior': 'unknown',
                'confidence': 0.50,
                'risk_level': 'unknown',
                'prediction_time': timezone.now().isoformat()
            }

class PredictionHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        predictions = UserPrediction.objects.filter(
            user=request.user
        ).order_by('-prediction_time')
        
        return Response(
            PredictionHistorySerializer(predictions, many=True).data
        )

class ViolationCheckView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            vessel_data = request.data.get('vessel_data', {})
            
            # Implement violation checking logic
            violations = {
                'in_restricted_zone': False,
                'speed_violation': False,
                'suspicious_behavior': False,
                'check_time': timezone.now().isoformat(),
                'vessel_id': vessel_data.get('vessel_id', 'unknown'),
                'location': {
                    'latitude': vessel_data.get('latitude', 0),
                    'longitude': vessel_data.get('longitude', 0)
                }
            }
            
            return Response({
                'violations': violations,
                'timestamp': timezone.now().isoformat(),
                'user': request.user.username
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )