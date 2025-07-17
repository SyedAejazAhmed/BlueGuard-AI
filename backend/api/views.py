from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
import json
import logging

from .models import VesselTrack, UserPrediction, UserSession, VesselAlert
from .serializers import (
    UserSerializer, 
    PredictionHistorySerializer, 
    VesselTrackSerializer,
    UserSessionSerializer
)

logger = logging.getLogger(__name__)

class LoginView(APIView):
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            if not username or not password:
                return Response(
                    {'error': 'Username and password are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = authenticate(username=username, password=password)
            
            if user and user.is_active:
                login(request, user)
                user.last_login = timezone.now()
                user.save()
                
                # Create or get token
                token, created = Token.objects.get_or_create(user=user)
                
                # Create user session
                user_session = UserSession.objects.create(
                    user=user,
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )
                
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key,
                    'session_id': user_session.id,
                    'message': 'Login successful'
                })
            
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {'error': 'Login failed'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # End user session
            user_sessions = UserSession.objects.filter(
                user=request.user, 
                is_active=True
            )
            for session in user_sessions:
                session.end_session()
            
            # Delete token
            try:
                token = Token.objects.get(user=request.user)
                token.delete()
            except Token.DoesNotExist:
                pass
            
            logout(request)
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response(
                {'error': 'Logout failed'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            user_data = UserSerializer(request.user).data
            
            # Add additional user stats
            user_data['stats'] = {
                'total_predictions': UserPrediction.objects.filter(user=request.user).count(),
                'total_tracks': VesselTrack.objects.filter(user=request.user).count(),
                'active_sessions': UserSession.objects.filter(
                    user=request.user, 
                    is_active=True
                ).count()
            }
            
            return Response(user_data)
            
        except Exception as e:
            logger.error(f"Get current user error: {str(e)}")
            return Response(
                {'error': 'Failed to get user data'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ModelStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Check availability of different model types
            model_status = {
                'ais': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0.0',
                    'description': 'AIS Behavior Analysis Model'
                },
                'fishing': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0.0',
                    'description': 'Fishing Activity Detection Model'
                },
                'kattegat': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0.0',
                    'description': 'Kattegat Region Analysis Model'
                },
                'violation': {
                    'status': True,
                    'last_updated': timezone.now().isoformat(),
                    'version': '1.0.0',
                    'description': 'Violation Detection Model'
                }
            }
            
            return Response({
                'models': model_status,
                'timestamp': timezone.now().isoformat(),
                'user': request.user.username,
                'system_status': 'operational'
            })
            
        except Exception as e:
            logger.error(f"Model status error: {str(e)}")
            return Response(
                {'error': 'Failed to get model status'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PredictionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data.get('data')
            model_type = request.data.get('model_type', 'ais')
            
            if not data:
                return Response(
                    {'error': 'No data provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            with transaction.atomic():
                if isinstance(data, list):
                    # Multiple vessel data
                    tracks = []
                    predictions = []
                    
                    for vessel_data in data:
                        track = self._create_vessel_track(request.user, vessel_data)
                        tracks.append(track)
                        
                        prediction = self._get_prediction(vessel_data, model_type)
                        predictions.append(prediction)
                        
                        # Store user prediction
                        UserPrediction.objects.create(
                            user=request.user,
                            vessel_track=track,
                            model_type=model_type,
                            prediction_result=prediction,
                            confidence=prediction.get('confidence', 0.0)
                        )
                    
                    return Response({
                        'predictions': predictions,
                        'track_ids': [t.id for t in tracks],
                        'model_type': model_type,
                        'timestamp': timezone.now().isoformat(),
                        'count': len(predictions)
                    })
                
                else:
                    # Single vessel data
                    track = self._create_vessel_track(request.user, data)
                    prediction = self._get_prediction(data, model_type)
                    
                    UserPrediction.objects.create(
                        user=request.user,
                        vessel_track=track,
                        model_type=model_type,
                        prediction_result=prediction,
                        confidence=prediction.get('confidence', 0.0)
                    )
                    
                    return Response({
                        'prediction': prediction,
                        'track_id': track.id,
                        'model_type': model_type,
                        'timestamp': timezone.now().isoformat()
                    })
                    
        except ValidationError as e:
            return Response(
                {'error': f'Validation error: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return Response(
                {'error': 'Prediction failed'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _create_vessel_track(self, user, vessel_data):
        """Create a vessel track record"""
        try:
            track = VesselTrack.objects.create(
                user=user,
                vessel_id=vessel_data.get('vessel_id', ''),
                mmsi=vessel_data.get('mmsi', ''),
                timestamp=vessel_data.get('timestamp', timezone.now()),
                latitude=float(vessel_data.get('latitude', 0)),
                longitude=float(vessel_data.get('longitude', 0)),
                speed=float(vessel_data.get('speed', 0)) if vessel_data.get('speed') else None,
                course=float(vessel_data.get('course', 0)) if vessel_data.get('course') else None,
            )
            return track
        except (ValueError, TypeError) as e:
            raise ValidationError(f"Invalid vessel data: {str(e)}")
    
    def _get_prediction(self, data, model_type):
        """Get prediction based on model type"""
        try:
            # Mock prediction logic - replace with actual model calls
            base_prediction = {
                'model_type': model_type,
                'prediction_time': timezone.now().isoformat(),
                'vessel_id': data.get('vessel_id', 'unknown'),
                'location': {
                    'latitude': data.get('latitude', 0),
                    'longitude': data.get('longitude', 0)
                }
            }
            
            if model_type == 'ais':
                prediction = {
                    **base_prediction,
                    'behavior': 'normal',
                    'confidence': 0.95,
                    'risk_level': 'low',
                    'anomaly_score': 0.05
                }
            elif model_type == 'fishing':
                prediction = {
                    **base_prediction,
                    'behavior': 'fishing',
                    'confidence': 0.85,
                    'risk_level': 'medium',
                    'fishing_probability': 0.85
                }
            elif model_type == 'kattegat':
                prediction = {
                    **base_prediction,
                    'behavior': 'transit',
                    'confidence': 0.92,
                    'risk_level': 'low',
                    'region_compliance': True
                }
            elif model_type == 'violation':
                prediction = {
                    **base_prediction,
                    'behavior': 'compliant',
                    'confidence': 0.88,
                    'risk_level': 'low',
                    'violations': []
                }
            else:
                prediction = {
                    **base_prediction,
                    'behavior': 'unknown',
                    'confidence': 0.50,
                    'risk_level': 'unknown'
                }
            
            return prediction
            
        except Exception as e:
            logger.error(f"Prediction generation error: {str(e)}")
            return {
                'error': 'Prediction generation failed',
                'model_type': model_type,
                'prediction_time': timezone.now().isoformat()
            }

class PredictionHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get query parameters
            model_type = request.query_params.get('model_type')
            limit = int(request.query_params.get('limit', 50))
            
            # Build query
            queryset = UserPrediction.objects.filter(
                user=request.user,
                is_active=True
            ).select_related('vessel_track').order_by('-prediction_time')
            
            if model_type:
                queryset = queryset.filter(model_type=model_type)
            
            # Apply limit
            predictions = queryset[:limit]
            
            return Response({
                'predictions': PredictionHistorySerializer(predictions, many=True).data,
                'count': len(predictions),
                'model_type': model_type,
                'timestamp': timezone.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Prediction history error: {str(e)}")
            return Response(
                {'error': 'Failed to get prediction history'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ViolationCheckView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            vessel_data = request.data.get('vessel_data', {})
            
            if not vessel_data:
                return Response(
                    {'error': 'No vessel data provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Implement violation checking logic
            violations = self._check_violations(vessel_data)
            
            return Response({
                'violations': violations,
                'timestamp': timezone.now().isoformat(),
                'user': request.user.username,
                'vessel_id': vessel_data.get('vessel_id', 'unknown')
            })
            
        except Exception as e:
            logger.error(f"Violation check error: {str(e)}")
            return Response(
                {'error': 'Violation check failed'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _check_violations(self, vessel_data):
        """Check for various violations"""
        violations = {
            'in_restricted_zone': False,
            'speed_violation': False,
            'suspicious_behavior': False,
            'missing_data': False,
            'check_time': timezone.now().isoformat(),
            'vessel_id': vessel_data.get('vessel_id', 'unknown'),
            'location': {
                'latitude': vessel_data.get('latitude', 0),
                'longitude': vessel_data.get('longitude', 0)
            },
            'details': []
        }
        
        # Check for missing required data
        required_fields = ['vessel_id', 'latitude', 'longitude']
        for field in required_fields:
            if not vessel_data.get(field):
                violations['missing_data'] = True
                violations['details'].append(f"Missing required field: {field}")