from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import sys
import os
import logging
from datetime import datetime
import json
import io

# Add paths for your modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'model'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'geospatial'))

# Import your existing modules
from model.model_utils.load_predict import router as model_router
from geospatial.geofencing.fence_utils import check_zone_violation
from geospatial.zone_violation_detector.detect_violation import detect_illegal_behavior as detect_violations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Maritime Surveillance API",
    description="API for maritime vessel tracking and analysis",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class VesselData(BaseModel):
    vessel_id: str
    latitude: float
    longitude: float
    speed: float
    course: float
    vessel_type: Optional[str] = None
    timestamp: Optional[str] = None

class CoordinateData(BaseModel):
    latitude: float
    longitude: float

class PredictionResponse(BaseModel):
    vessel_id: str
    predictions: Dict[str, Any]
    confidence: float
    timestamp: str

class ZoneCheckResponse(BaseModel):
    latitude: float
    longitude: float
    zone_type: Optional[str]
    is_violation: bool
    zone_name: Optional[str]

class VesselAnalysisResponse(BaseModel):
    vessel_id: str
    analysis_results: Dict[str, Any]
    risk_score: float
    recommendations: List[str]

# Include your existing model router
app.include_router(model_router, prefix="/api/model", tags=["model"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Main prediction endpoint
@app.post("/api/predict/", response_model=PredictionResponse)
async def predict_vessel(vessel_data: VesselData):
    """
    Predict vessel behavior using your ML models
    """
    try:
        logger.info(f"Received prediction request for vessel: {vessel_data.vessel_id}")
        
        # Convert to format your model expects
        input_data = {
            'vessel_id': vessel_data.vessel_id,
            'latitude': vessel_data.latitude,
            'longitude': vessel_data.longitude,
            'speed': vessel_data.speed,
            'course': vessel_data.course,
            'vessel_type': vessel_data.vessel_type,
            'timestamp': vessel_data.timestamp or datetime.now().isoformat()
        }
        
        # Call your existing model prediction logic
        # This should connect to your model/model_utils/load_predict.py
        predictions = await call_model_prediction(input_data)
        
        response = PredictionResponse(
            vessel_id=vessel_data.vessel_id,
            predictions=predictions,
            confidence=predictions.get('confidence', 0.0),
            timestamp=datetime.now().isoformat()
        )
        
        logger.info(f"Prediction completed for vessel: {vessel_data.vessel_id}")
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Zone checking endpoint
@app.post("/api/check-zone/", response_model=ZoneCheckResponse)
async def check_zone(coordinate_data: CoordinateData):
    """
    Check if coordinates fall within protected zones
    """
    try:
        logger.info(f"Checking zone for coordinates: {coordinate_data.latitude}, {coordinate_data.longitude}")
        
        # Call your existing geospatial logic
        zone_result = check_zone_violation(
            coordinate_data.latitude, 
            coordinate_data.longitude
        )
        
        response = ZoneCheckResponse(
            latitude=coordinate_data.latitude,
            longitude=coordinate_data.longitude,
            zone_type=zone_result.get('zone_type'),
            is_violation=zone_result.get('is_violation', False),
            zone_name=zone_result.get('zone_name')
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Zone check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Zone check failed: {str(e)}")

# Vessel analysis endpoint
@app.post("/api/analyze-vessel/", response_model=VesselAnalysisResponse)
async def analyze_vessel(vessel_data: VesselData):
    """
    Comprehensive vessel analysis combining multiple models
    """
    try:
        logger.info(f"Analyzing vessel: {vessel_data.vessel_id}")
        
        # Combine prediction and zone checking
        input_data = {
            'vessel_id': vessel_data.vessel_id,
            'latitude': vessel_data.latitude,
            'longitude': vessel_data.longitude,
            'speed': vessel_data.speed,
            'course': vessel_data.course,
            'vessel_type': vessel_data.vessel_type,
        }
        
        # Get ML predictions
        predictions = await call_model_prediction(input_data)
        
        # Check zone violations
        zone_result = check_zone_violation(
            vessel_data.latitude, 
            vessel_data.longitude
        )
        
        # Detect violations using your existing logic
        violations = detect_violations(input_data)
        
        # Combine results
        analysis_results = {
            'predictions': predictions,
            'zone_check': zone_result,
            'violations': violations,
            'anomaly_score': predictions.get('anomaly_score', 0.0)
        }
        
        # Calculate risk score
        risk_score = calculate_risk_score(analysis_results)
        
        # Generate recommendations
        recommendations = generate_recommendations(analysis_results)
        
        response = VesselAnalysisResponse(
            vessel_id=vessel_data.vessel_id,
            analysis_results=analysis_results,
            risk_score=risk_score,
            recommendations=recommendations
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Vessel analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vessel analysis failed: {str(e)}")

# File upload endpoint for AIS data
@app.post("/api/upload-ais/")
async def upload_ais_data(file: UploadFile = File(...)):
    """
    Upload and process AIS data file
    """
    try:
        logger.info(f"Processing uploaded file: {file.filename}")
        
        # Read file content
        content = await file.read()
        
        # Process based on file type
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        elif file.filename.endswith('.json'):
            data = json.loads(content.decode('utf-8'))
            df = pd.DataFrame(data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Process the data through your existing pipeline
        processed_results = process_ais_data(df)
        
        return {
            "message": "File processed successfully",
            "records_processed": len(df),
            "results": processed_results
        }
        
    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

# Helper functions to connect to your existing code
async def call_model_prediction(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Connect to your existing model prediction logic
    """
    # This should call your model/model_utils/load_predict.py functions
    # Adapt this to match your existing model interface
    
    try:
        # Example structure - adapt to your actual model calls
        from model.model_utils.load_predict import predict_vessel_behavior
        
        predictions = predict_vessel_behavior(input_data)
        
        return {
            'vessel_type_prediction': predictions.get('vessel_type'),
            'anomaly_score': predictions.get('anomaly_score', 0.0),
            'fishing_probability': predictions.get('fishing_prob', 0.0),
            'confidence': predictions.get('confidence', 0.0),
            'trajectory_prediction': predictions.get('trajectory')
        }
        
    except Exception as e:
        logger.error(f"Model prediction error: {str(e)}")
        return {'error': str(e)}

def calculate_risk_score(analysis_results: Dict[str, Any]) -> float:
    """
    Calculate overall risk score based on analysis results
    """
    risk_factors = []
    
    # Add risk from anomaly detection
    anomaly_score = analysis_results.get('predictions', {}).get('anomaly_score', 0.0)
    risk_factors.append(anomaly_score * 0.4)
    
    # Add risk from zone violations
    if analysis_results.get('zone_check', {}).get('is_violation'):
        risk_factors.append(0.3)
    
    # Add risk from speed/course anomalies
    violations = analysis_results.get('violations', [])
    if violations:
        risk_factors.append(len(violations) * 0.1)
    
    return min(sum(risk_factors), 1.0)

def generate_recommendations(analysis_results: Dict[str, Any]) -> List[str]:
    """
    Generate recommendations based on analysis results
    """
    recommendations = []
    
    if analysis_results.get('zone_check', {}).get('is_violation'):
        recommendations.append("Vessel is in restricted zone - immediate attention required")
    
    if analysis_results.get('predictions', {}).get('anomaly_score', 0) > 0.7:
        recommendations.append("Vessel showing anomalous behavior - monitor closely")
    
    if analysis_results.get('predictions', {}).get('fishing_probability', 0) > 0.8:
        recommendations.append("High probability of fishing activity - verify permits")
    
    if not recommendations:
        recommendations.append("No immediate action required - continue monitoring")
    
    return recommendations

def process_ais_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Process uploaded AIS data through your existing pipeline
    """
    try:
        # Connect to your existing AIS processing logic
        # This should use your existing functions
        
        results = {
            'total_records': len(df),
            'unique_vessels': df['vessel_id'].nunique() if 'vessel_id' in df.columns else 0,
            'time_range': {
                'start': df['timestamp'].min() if 'timestamp' in df.columns else None,
                'end': df['timestamp'].max() if 'timestamp' in df.columns else None
            },
            'summary': 'AIS data processed successfully'
        }
        
        return results
        
    except Exception as e:
        logger.error(f"AIS processing error: {str(e)}")
        return {'error': str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)