from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os
import pandas as pd
from datetime import datetime
import sys

# Add the model and geospatial paths to system path
project_root = settings.BASE_DIR.parent
sys.path.append(project_root)

# Import the required modules correctly
from model.model_utils.load_predict import load_model_bundle
from geospatial.zone_violation_detector.detect_violation import detect_illegal_behavior

# Define model directories
MODEL_BASE_DIR = os.path.join(project_root, "model", "model_utils")
AIS_DIR = os.path.join(MODEL_BASE_DIR, "ais")
FISHING_TRAJECTORIES_DIR = os.path.join(MODEL_BASE_DIR, "fishing_trajectories")
KATTEGAT_JAN_MAR_DIR = os.path.join(MODEL_BASE_DIR, "kattegat_jan_mar")

class PredictionView(APIView):
    def post(self, request):
        try:
            # Get input data
            data = request.data.get('data')
            model_type = request.data.get('model_type', 'ais')  # default to AIS model
            
            # Select appropriate model bundle based on type
            if model_type == 'ais':
                model_bundle = load_model_bundle(AIS_DIR)
            elif model_type == 'fishing':
                model_bundle = load_model_bundle(FISHING_TRAJECTORIES_DIR)
            elif model_type == 'kattegat':
                model_bundle = load_model_bundle(KATTEGAT_JAN_MAR_DIR)
            else:
                return Response(
                    {'error': f'Invalid model type: {model_type}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare data using scaler and encoder if available
            if model_bundle['scaler']:
                data = model_bundle['scaler'].transform(data)
            if model_bundle['encoder']:
                data = model_bundle['encoder'].transform(data)
            
            # Make prediction
            prediction = model_bundle['model'].predict(data)
            
            response_data = {
                'prediction': prediction.tolist() if hasattr(prediction, 'tolist') else prediction,
                'model_type': model_type,
                'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ViolationCheckView(APIView):
    def post(self, request):
        try:
            # Get vessel data
            vessel_data = request.data.get('vessel_data')
            if not vessel_data:
                return Response(
                    {'error': 'No vessel data provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Detect illegal behavior
            violations = detect_illegal_behavior(vessel_data)
            
            return Response({
                'violations': violations,
                'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class ModelStatusView(APIView):
    def get(self, request):
        try:
            # Check available models
            model_status = {
                'ais': load_model_bundle(AIS_DIR) is not None,
                'fishing': load_model_bundle(FISHING_TRAJECTORIES_DIR) is not None,
                'kattegat': load_model_bundle(KATTEGAT_JAN_MAR_DIR) is not None
            }
            
            return Response({
                'status': model_status,
                'timestamp': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )