# Cell 1: Set base model directory and list subfolders

import os
import joblib
import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Any
from fastapi import APIRouter, Body
from pydantic import BaseModel

# Base directory where all models are saved
MODEL_BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Define subdirectories for each dataset model group
AIS_DIR = os.path.join(MODEL_BASE_DIR, "ais")
FISHING_TRAJECTORIES_DIR = os.path.join(MODEL_BASE_DIR, "fishing_trajectories")
KATTEGAT_JAN_MAR_DIR = os.path.join(MODEL_BASE_DIR, "kattegat_jan_mar")

# Optional: List contents of each for reference
print("AIS Models:")
print(os.listdir(AIS_DIR))

print("\nFishing Trajectories Models:")
print(os.listdir(FISHING_TRAJECTORIES_DIR))

print("\nKattegat Jan-Mar Models:")
print(os.listdir(KATTEGAT_JAN_MAR_DIR))

def load_model_bundle(model_dir):
    model = None
    scaler = None
    encoder = None

    # Load model file (look for known names)
    for fname in os.listdir(model_dir):
        fpath = os.path.join(model_dir, fname)
        if "model" in fname.lower() and fname.endswith(('.joblib', '.pkl')):
            model = joblib.load(fpath)
        elif "scaler" in fname.lower():
            scaler = joblib.load(fpath)
        elif "encoder" in fname.lower():
            encoder = joblib.load(fpath)

    return {
        "model": model,
        "scaler": scaler,
        "encoder": encoder,
        "path": model_dir
    }

# Example load test
ais_bundle = load_model_bundle(AIS_DIR)
fishing_bundle = load_model_bundle(FISHING_TRAJECTORIES_DIR)
kattegat_bundle = load_model_bundle(KATTEGAT_JAN_MAR_DIR)

print("Loaded AIS model:", type(ais_bundle['model']).__name__)
print("Loaded Fishing model:", type(fishing_bundle['model']).__name__)
print("Loaded Kattegat model:", type(kattegat_bundle['model']).__name__)

# Additional validation
print("\nModel Bundle Summary:")
for name, bundle in [("AIS", ais_bundle), ("Fishing", fishing_bundle), ("Kattegat", kattegat_bundle)]:
    print(f"  {name}:")
    print(f"    Model: {'OK' if bundle['model'] else 'XX'} {type(bundle['model']).__name__ if bundle['model'] else 'None'}")
    print(f"    Scaler: {'OK' if bundle['scaler'] else 'XX'} {type(bundle['scaler']).__name__ if bundle['scaler'] else 'None'}")
    print(f"    Encoder: {'OK' if bundle['encoder'] else 'XX'} {type(bundle['encoder']).__name__ if bundle['encoder'] else 'None'}")

class ModelAgent(ABC):
    """Base class for all model agents"""
    
    def __init__(self, name: str, model, scaler=None, encoder=None):
        self.name = name
        self.model = model
        self.scaler = scaler
        self.encoder = encoder
        self.confidence_threshold = 0.7
    
    @abstractmethod
    def get_purpose(self) -> str:
        """Return what this agent is designed to predict"""
        pass
    
    @abstractmethod
    def get_required_features(self) -> List[str]:
        """Return list of required feature names"""
        pass
    
    @abstractmethod
    def can_handle_input(self, input_data: pd.DataFrame) -> bool:
        """Check if this agent can handle the given input"""
        pass
    
    def validate_input(self, input_data: pd.DataFrame) -> Tuple[bool, str]:
        """Validate input data format and features"""
        required_features = self.get_required_features()
        missing_features = [f for f in required_features if f not in input_data.columns]
        
        if missing_features:
            return False, f"Missing features: {missing_features}"
        
        # Check for non-numeric values
        for col in required_features:
            if not pd.api.types.is_numeric_dtype(input_data[col]):
                return False, f"Feature '{col}' must be numeric"
        
        return True, "Input validation passed"
    
    def preprocess_input(self, input_data: pd.DataFrame) -> pd.DataFrame:
        """Preprocess input data for model prediction"""
        # Select only required features in correct order
        required_features = self.get_required_features()
        processed_data = input_data[required_features].copy()
        
        # Apply scaling if scaler exists
        if self.scaler is not None:
            processed_data = pd.DataFrame(
                self.scaler.transform(processed_data),
                columns=processed_data.columns
            )
        
        return processed_data
    
    def predict(self, input_data: pd.DataFrame) -> Dict[str, Any]:
        """Make prediction and return structured result"""
        try:
            # Validate input
            is_valid, message = self.validate_input(input_data)
            if not is_valid:
                return {
                    "success": False,
                    "error": message,
                    "agent": self.name
                }
            
            # Preprocess
            processed_data = self.preprocess_input(input_data)
            
            # Make prediction
            prediction = self.model.predict(processed_data)
            
            # Get probability if available
            confidence = None
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(processed_data)
                confidence = float(np.max(proba))
            
            # Decode prediction if encoder exists
            if self.encoder is not None:
                prediction = self.encoder.inverse_transform(prediction)
            
            return {
                "success": True,
                "prediction": prediction[0] if len(prediction) == 1 else prediction,
                "confidence": confidence,
                "agent": self.name,
                "purpose": self.get_purpose()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": self.name
            }

print("Base ModelAgent class defined")

class AISAgent(ModelAgent):
    """Agent for AIS vessel classification"""
    
    def get_purpose(self) -> str:
        return "Classify vessel type based on AIS data (SOG, COG, Heading, Length, Width, Draft)"
    
    def get_required_features(self) -> List[str]:
        return ['SOG', 'COG', 'Heading', 'Length', 'Width', 'Draft']
    
    def can_handle_input(self, input_data: pd.DataFrame) -> bool:
        """Check if input contains AIS-type data"""
        ais_indicators = ['SOG', 'COG', 'Heading', 'Length', 'Width', 'Draft']
        return any(col in input_data.columns for col in ais_indicators)

class FishingTrajectoriesAgent(ModelAgent):
    """Agent for fishing behavior prediction"""
    
    def get_purpose(self) -> str:
        return "Predict fishing behavior based on vessel trajectory patterns"
    
    def get_required_features(self) -> List[str]:
        return ['SOG', 'sog_diff', 'time_diff', 'distance']
    
    def can_handle_input(self, input_data: pd.DataFrame) -> bool:
        """Check if input contains trajectory-type data"""
        trajectory_indicators = ['sog_diff', 'time_diff', 'distance']
        return any(col in input_data.columns for col in trajectory_indicators)

class KattegatAgent(ModelAgent):
    """Agent for Kattegat region vessel analysis"""
    
    def get_purpose(self) -> str:
        return "Analyze vessel behavior in Kattegat region (Jan-Mar period)"
    
    def get_required_features(self) -> List[str]:
        return ['length', 'draught', 'cog', 'heading', 'speed', 'area']
    
    def can_handle_input(self, input_data: pd.DataFrame) -> bool:
        """Check if input contains Kattegat-type data"""
        kattegat_indicators = ['length', 'draught', 'area']
        return any(col in input_data.columns for col in kattegat_indicators)

print("Specific agent classes defined")

class AgentRouter:
    """Routes input to appropriate agent based on data characteristics"""
    
    def __init__(self):
        self.agents = {}
        self.default_agent = None
    
    def register_agent(self, key: str, agent: ModelAgent, is_default: bool = False):
        """Register an agent with the router"""
        self.agents[key] = agent
        if is_default:
            self.default_agent = agent
        print(f"Registered agent: {agent.name}")
    
    def find_compatible_agents(self, input_data: pd.DataFrame) -> List[str]:
        """Find all agents that can handle the input"""
        compatible = []
        for key, agent in self.agents.items():
            if agent.can_handle_input(input_data):
                compatible.append(key)
        return compatible
    
    def route_prediction(self, input_data: pd.DataFrame, preferred_agent: str = None) -> Dict[str, Any]:
        """Route prediction to most appropriate agent"""
        
        # If specific agent requested, use it
        if preferred_agent and preferred_agent in self.agents:
            agent = self.agents[preferred_agent]
            result = agent.predict(input_data)
            result['routing_info'] = f"Used requested agent: {preferred_agent}"
            return result
        
        # Find compatible agents
        compatible_agents = self.find_compatible_agents(input_data)
        
        if not compatible_agents:
            return {
                "success": False,
                "error": "No compatible agents found for this input data",
                "available_agents": list(self.agents.keys()),
                "input_columns": list(input_data.columns)
            }
        
        # Use first compatible agent (can be enhanced with scoring)
        chosen_agent_key = compatible_agents[0]
        agent = self.agents[chosen_agent_key]
        
        result = agent.predict(input_data)
        result['routing_info'] = f"Auto-selected agent: {chosen_agent_key}"
        result['compatible_agents'] = compatible_agents
        
        return result
    
    def get_agent_info(self) -> Dict[str, str]:
        """Get information about all registered agents"""
        info = {}
        for key, agent in self.agents.items():
            info[key] = {
                "name": agent.name,
                "purpose": agent.get_purpose(),
                "required_features": agent.get_required_features()
            }
        return info

# Create router instance
agent_router = AgentRouter()
print("Agent router created")

# Initialize agents with loaded models
try:
    # AIS Agent
    ais_agent = AISAgent(
        name="AIS Vessel Classifier",
        model=ais_bundle['model'],
        scaler=ais_bundle.get('scaler'),
        encoder=ais_bundle.get('encoder')
    )
    agent_router.register_agent('ais', ais_agent)
    
    # Fishing Trajectories Agent
    fishing_agent = FishingTrajectoriesAgent(
        name="Fishing Behavior Predictor",
        model=fishing_bundle['model'],
        scaler=fishing_bundle.get('scaler'),
        encoder=fishing_bundle.get('encoder')
    )
    agent_router.register_agent('fishing', fishing_agent)
    
    # Kattegat Agent
    kattegat_agent = KattegatAgent(
        name="Kattegat Region Analyzer",
        model=kattegat_bundle['model'],
        scaler=kattegat_bundle.get('scaler'),
        encoder=kattegat_bundle.get('encoder')
    )
    agent_router.register_agent('kattegat', kattegat_agent, is_default=True)
    
    print("All agents initialized successfully")
    
    # Display agent information
    print("\nAvailable Agents:")
    for key, info in agent_router.get_agent_info().items():
        print(f"\n{key.upper()}:")
        print(f"   Name: {info['name']}")
        print(f"   Purpose: {info['purpose']}")
        print(f"   Required Features: {info['required_features']}")
        
except Exception as e:
    print(f"Error initializing agents: {e}")

# Create FastAPI router
router = APIRouter()

class VesselPredictionRequest(BaseModel):
    vessel_id: Optional[str] = None
    latitude: float
    longitude: float
    SOG: Optional[float] = None
    COG: Optional[float] = None
    Heading: Optional[float] = None
    Length: Optional[float] = None
    Width: Optional[float] = None
    Draft: Optional[float] = None
    sog_diff: Optional[float] = None
    time_diff: Optional[float] = None
    distance: Optional[float] = None
    length: Optional[float] = None
    draught: Optional[float] = None
    cog: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None
    area: Optional[float] = None
    preferred_agent: Optional[str] = None

@router.post("/predict")
def predict_vessel_behavior(request: VesselPredictionRequest):
    input_df = pd.DataFrame([request.dict()])
    result = agent_router.route_prediction(input_df, preferred_agent=request.preferred_agent)
    return result

if __name__ == "__main__":
    # This block is for debugging and won't run when imported by FastAPI
    pass