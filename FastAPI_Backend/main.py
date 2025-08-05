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
import httpx

# Set up project paths first, before any imports
import os
import sys

# Get the absolute paths
current_dir = os.path.abspath(os.path.dirname(__file__))
project_root = os.path.dirname(current_dir)

# Add paths to sys.path if they're not already there
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Now configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log the paths for debugging
logger.info(f"Current directory: {current_dir}")
logger.info(f"Project root: {project_root}")
logger.info(f"Python path: {sys.path}")

# Try importing the required modules
try:
    from model.model_utils.load_predict import router as model_router
    from geospatial.geofencing.fence_utils import check_zone_violation
    from geospatial.zone_violation_detector.detect_violation import detect_illegal_behavior as detect_violations
    logger.info("Successfully imported required modules")
except ImportError as e:
    logger.error(f"Failed to import required modules: {str(e)}")
    raise
    logger.info("Base modules found")
    
    # Then import specific components
    from model.model_utils.load_predict import router as model_router
    from geospatial.geofencing.fence_utils import check_zone_violation
    from geospatial.zone_violation_detector.detect_violation import detect_illegal_behavior as detect_violations
    logger.info("Successfully imported required module components")
except ImportError as e:
    logger.error(f"Error importing modules: {str(e)}")
    logger.error(f"Please ensure model and geospatial packages are in: {project_root}")
    raise

# Log startup information
logger.info("Starting Maritime Surveillance API")

app = FastAPI(
    title="Maritime Surveillance API",
    description="API for maritime vessel tracking and analysis",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
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

class ZoneCheckVessel(BaseModel):
    vessel_id: str
    latitude: float
    longitude: float

class ZoneCheckRequest(BaseModel):
    vessels: List[ZoneCheckVessel]

class ZoneViolationDetail(BaseModel):
    vessel_id: str
    zone_type: str
    timestamp: str
    location: List[float]
    duration: Optional[float] = None
    severity: str
    details: Optional[str] = None

class ZoneCheckResponse(BaseModel):
    success: bool
    total_vessels: int
    violations: int
    mpa_violations: int
    eez_violations: int
    processing_time: str
    results: List[ZoneViolationDetail]

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

@app.post("/api/check-zone/", response_model=ZoneCheckResponse)
async def check_zone_violations(request: ZoneCheckRequest):
    """
    Check vessel coordinates for zone violations
    """
    try:
        logger.info(f"Checking zone violations for {len(request.vessels)} vessels")
        
        # Process each vessel's coordinates through the zone violation detector
        violations = []
        mpa_count = 0
        eez_count = 0
        
        for vessel in request.vessels:
            # Mock check for violations (replace with actual implementation)
            is_violation = check_zone_violation([(vessel.latitude, vessel.longitude)])
            if is_violation["results"]:
                violations.extend(is_violation["results"])
                if is_violation["mpa_violations"] > 0:
                    mpa_count += 1
                if is_violation["eez_violations"] > 0:
                    eez_count += 1
        
        return {
            "success": True,
            "total_vessels": len(request.vessels),
            "violations": len(violations),
            "mpa_violations": mpa_count,
            "eez_violations": eez_count,
            "processing_time": "0.5s",
            "results": violations
        }
        
    except Exception as e:
        logger.error(f"Error checking zone violations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

# Single coordinate zone checking endpoint
@app.post("/api/check-single-zone/", response_model=ZoneCheckResponse)
async def check_single_zone(coordinate_data: CoordinateData):
    """
    Check if a single coordinate falls within protected zones
    """
    try:
        logger.info(f"Checking zone for coordinates: {coordinate_data.latitude}, {coordinate_data.longitude}")
        
        # Create a single vessel check request
        request = ZoneCheckRequest(vessels=[
            ZoneCheckVessel(
                vessel_id="SINGLE_CHECK",
                latitude=coordinate_data.latitude,
                longitude=coordinate_data.longitude
            )
        ])
        
        # Reuse the main zone checking logic
        return await check_zone_violations(request)
        
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

# CSV URL fetching endpoint
@app.get("/api/fetch-csv/")
async def fetch_csv_from_url(url: str):
    """
    Fetch CSV data from a URL
    """
    try:
        logger.info(f"Attempting to fetch CSV from URL: {url}")
        
        # Convert GitHub URLs to raw format
        if 'github.com' in url and '/blob/' in url:
            url = url.replace('github.com', 'raw.githubusercontent.com')
            url = url.replace('/blob/', '/')
            logger.info(f"Converted GitHub URL to: {url}")
        
        async with httpx.AsyncClient() as client:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/csv,application/csv,text/plain,*/*'
            }
            
            response = await client.get(url, headers=headers, follow_redirects=True)
            response.raise_for_status()
            
            # Check if the response is actually CSV data
            content_type = response.headers.get('content-type', '')
            if not any(ct in content_type.lower() for ct in ['text/csv', 'application/csv', 'text/plain']):
                logger.warning(f"Unexpected content type: {content_type}")
            
            content = response.text
            if not content.strip():
                raise HTTPException(status_code=400, detail="Empty CSV file")
            
            # Extract filename from URL
            filename = url.split('/')[-1]
            if not filename.endswith('.csv'):
                filename = 'downloaded.csv'
            
            return {
                "success": True,
                "csv_data": content,
                "filename": filename,
                "content_type": content_type
            }
            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching CSV: {str(e)}")
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="CSV file not found at the specified URL")
        raise HTTPException(status_code=e.response.status_code, detail=f"HTTP error: {str(e)}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch CSV: {str(e)}")

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
        # Import the agent router from load_predict.py
        from model.model_utils.load_predict import agent_router
        import pandas as pd
        
        # Convert to DataFrame as expected by the model
        # Map the input data to the required features for the AIS agent
        input_df = pd.DataFrame([{
            'SOG': input_data.get('speed', 0),
            'COG': input_data.get('course', 0),
            'Heading': 0,  # Default value
            'Length': 0,   # Default value
            'Width': 0,    # Default value
            'Draft': 0,    # Default value
        }])
        
        # Use the agent router to make the prediction
        predictions = agent_router.route_prediction(input_df)
        
        # Extract the relevant information from the prediction result
        if predictions.get('success', False):
            return {
                'vessel_type_prediction': predictions.get('prediction', 'unknown'),
                'anomaly_score': 0.0,  # Default value
                'fishing_probability': 0.0,  # Default value
                'confidence': predictions.get('confidence', 0.0),
                'trajectory_prediction': 'unknown'
            }
        else:
            # If prediction failed, return the error
            return {'error': predictions.get('error', 'Unknown prediction error')}
        
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

# Run the FastAPI application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)