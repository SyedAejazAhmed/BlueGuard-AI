# ✅ Cell 1: Set base model directory and list subfolders

import os

# Base directory where all models are saved
MODEL_BASE_DIR = r"D:\Projects\Hackathon\Agentic Hackathon\model\model_utils"

# Define subdirectories for each dataset model group
AIS_DIR = os.path.join(MODEL_BASE_DIR, "ais")
FISHING_TRAJECTORIES_DIR = os.path.join(MODEL_BASE_DIR, "fishing_trajectories")
KATTEGAT_JAN_MAR_DIR = os.path.join(MODEL_BASE_DIR, "kattegat_jan_mar")

# Optional: List contents of each for reference
print("📁 AIS Models:")
print(os.listdir(AIS_DIR))

print("\n📁 Fishing Trajectories Models:")
print(os.listdir(FISHING_TRAJECTORIES_DIR))

print("\n📁 Kattegat Jan-Mar Models:")
print(os.listdir(KATTEGAT_JAN_MAR_DIR))
import joblib

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

print("✅ Loaded AIS model:", type(ais_bundle['model']).__name__)
print("✅ Loaded Fishing model:", type(fishing_bundle['model']).__name__)
print("✅ Loaded Kattegat model:", type(kattegat_bundle['model']).__name__)

# Additional validation
print("\n📊 Model Bundle Summary:")
for name, bundle in [("AIS", ais_bundle), ("Fishing", fishing_bundle), ("Kattegat", kattegat_bundle)]:
    print(f"  {name}:")
    print(f"    Model: {'✅' if bundle['model'] else '❌'} {type(bundle['model']).__name__ if bundle['model'] else 'None'}")
    print(f"    Scaler: {'✅' if bundle['scaler'] else '❌'} {type(bundle['scaler']).__name__ if bundle['scaler'] else 'None'}")
    print(f"    Encoder: {'✅' if bundle['encoder'] else '❌'} {type(bundle['encoder']).__name__ if bundle['encoder'] else 'None'}")

import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Any

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

print("✅ Base ModelAgent class defined")

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

print("✅ Specific agent classes defined")

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
        print(f"✅ Registered agent: {agent.name}")
    
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
router = AgentRouter()
print("✅ Agent router created")

# Initialize agents with loaded models
try:
    # AIS Agent
    ais_agent = AISAgent(
        name="AIS Vessel Classifier",
        model=ais_bundle['model'],
        scaler=ais_bundle.get('scaler'),
        encoder=ais_bundle.get('encoder')
    )
    router.register_agent('ais', ais_agent)
    
    # Fishing Trajectories Agent
    fishing_agent = FishingTrajectoriesAgent(
        name="Fishing Behavior Predictor",
        model=fishing_bundle['model'],
        scaler=fishing_bundle.get('scaler'),
        encoder=fishing_bundle.get('encoder')
    )
    router.register_agent('fishing', fishing_agent)
    
    # Kattegat Agent
    kattegat_agent = KattegatAgent(
        name="Kattegat Region Analyzer",
        model=kattegat_bundle['model'],
        scaler=kattegat_bundle.get('scaler'),
        encoder=kattegat_bundle.get('encoder')
    )
    router.register_agent('kattegat', kattegat_agent, is_default=True)
    
    print("✅ All agents initialized successfully")
    
    # Display agent information
    print("\n📋 Available Agents:")
    for key, info in router.get_agent_info().items():
        print(f"\n🔹 {key.upper()}:")
        print(f"   Name: {info['name']}")
        print(f"   Purpose: {info['purpose']}")
        print(f"   Required Features: {info['required_features']}")
        
except Exception as e:
    print(f"❌ Error initializing agents: {e}")

# Fixed test data for different agents with correct feature names
test_cases = {
    "ais_test": pd.DataFrame([{
        'SOG': 12.3,
        'COG': 85.0,
        'Heading': 90.0,
        'Length': 100.0,
        'Width': 20.0,
        'Draft': 6.0
    }]),
    
    "fishing_test": pd.DataFrame([{
        'SOG': 2.5,
        'sog_diff': -0.3,
        'time_diff': 300.0,
        'distance': 45.0
    }]),
    
    # Fixed Kattegat test data - need to check the actual feature names from training
    # The error shows the model expects navigational status features
    "kattegat_test": pd.DataFrame([{
        'length': 85.0,
        'draught': 5.2,
        'cog': 180.0,
        'heading': 185.0,
        'speed': 8.5,  # This might need to be different
        'area': 1800.0,
        # Add missing navigational status features (one-hot encoded)
        'navigationalstatus_At anchor': 0,
        'navigationalstatus_Constrained by her draught': 0,
        'navigationalstatus_Engaged in fishing': 1,  # Example: set to 1 for fishing
        'navigationalstatus_Moored': 0,
        'navigationalstatus_Not under command': 0,
        # Add other missing features as needed
    }])
}

# Better approach: Check what features each model actually expects
def inspect_model_features(agent_name, agent):
    """Inspect what features a model expects"""
    print(f"\n🔍 Inspecting {agent_name} Agent:")
    print(f"   Required features: {agent.get_required_features()}")
    
    # If the model has feature_names_in_ attribute (scikit-learn models)
    if hasattr(agent.model, 'feature_names_in_'):
        print(f"   Model trained on: {list(agent.model.feature_names_in_)}")
    
    # If the model has n_features_in_ attribute
    if hasattr(agent.model, 'n_features_in_'):
        print(f"   Number of features expected: {agent.model.n_features_in_}")

# Inspect all agents
print("🔍 Model Feature Inspection:")
for key, agent in router.agents.items():
    inspect_model_features(key.upper(), agent)

# Create a function to generate proper test data
def create_test_data_for_agent(agent_key):
    """Create proper test data based on agent requirements"""
    
    if agent_key == 'ais':
        return pd.DataFrame([{
            'SOG': 12.3,
            'COG': 85.0,
            'Heading': 90.0,
            'Length': 100.0,
            'Width': 20.0,
            'Draft': 6.0
        }])
    
    elif agent_key == 'fishing':
        return pd.DataFrame([{
            'SOG': 2.5,
            'sog_diff': -0.3,
            'time_diff': 300.0,
            'distance': 45.0
        }])
    
    elif agent_key == 'kattegat':
        # This needs to be adjusted based on actual model features
        # You'll need to check what features the Kattegat model was trained with
        agent = router.agents['kattegat']
        required_features = agent.get_required_features()
        
        # Create base data
        base_data = {
            'length': 85.0,
            'draught': 5.2,
            'cog': 180.0,
            'heading': 185.0,
            'speed': 8.5,
            'area': 1800.0
        }
        
        # If the model expects more features, we need to add them
        if hasattr(agent.model, 'feature_names_in_'):
            model_features = list(agent.model.feature_names_in_)
            print(f"Kattegat model expects these features: {model_features}")
            
            # Add missing features with default values
            for feature in model_features:
                if feature not in base_data:
                    if 'navigationalstatus_' in feature:
                        base_data[feature] = 0  # Default to 0 for one-hot encoded
                    else:
                        base_data[feature] = 0.0  # Default numeric value
        
        return pd.DataFrame([base_data])

# Test with improved data
print("\n🚀 Testing with Improved Data:")

for agent_key in ['ais', 'fishing', 'kattegat']:
    print(f"\n📊 Testing {agent_key.upper()} Agent:")
    
    try:
        test_data = create_test_data_for_agent(agent_key)
        print(f"   Input columns: {list(test_data.columns)}")
        
        # Test with specific agent
        result = router.route_prediction(test_data, preferred_agent=agent_key)
        
        if result['success']:
            print(f"   ✅ Prediction: {result['prediction']}")
            print(f"   🎯 Agent: {result['agent']}")
            if result.get('confidence'):
                print(f"   📊 Confidence: {result['confidence']:.2f}")
        else:
            print(f"   ❌ Error: {result['error']}")
    
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")

# Alternative: Create a feature mapping function
def create_feature_mapping():
    """Create mapping between different feature naming conventions"""
    return {
        'speed': 'SOG',  # Map speed to SOG if needed
        'sog': 'SOG',
        'course': 'COG',
        'cog': 'COG',
        # Add more mappings as needed
    }

# Function to normalize input data
def normalize_input_features(input_data, target_features):
    """Normalize input features to match model expectations"""
    mapping = create_feature_mapping()
    normalized_data = input_data.copy()
    
    # Apply mappings
    for old_name, new_name in mapping.items():
        if old_name in normalized_data.columns and new_name in target_features:
            normalized_data[new_name] = normalized_data[old_name]
            if old_name != new_name:
                normalized_data = normalized_data.drop(columns=[old_name])
    
    return normalized_data

print("\n✅ Updated test cases and inspection functions ready!")

# Debug script to identify and fix model feature issues

def debug_model_features(agent_name, agent):
    """Comprehensive debugging of model features"""
    print(f"\n🔍 DEBUGGING {agent_name.upper()} AGENT:")
    print(f"   Agent name: {agent.name}")
    print(f"   Required features (from agent): {agent.get_required_features()}")
    
    # Check model attributes
    model = agent.model
    print(f"   Model type: {type(model).__name__}")
    
    # Check various feature attributes
    if hasattr(model, 'feature_names_in_'):
        print(f"   Model feature_names_in_: {list(model.feature_names_in_)}")
        print(f"   Number of features: {len(model.feature_names_in_)}")
    
    if hasattr(model, 'n_features_in_'):
        print(f"   Model n_features_in_: {model.n_features_in_}")
    
    # Check scaler features if exists
    if agent.scaler:
        print(f"   Scaler type: {type(agent.scaler).__name__}")
        if hasattr(agent.scaler, 'feature_names_in_'):
            print(f"   Scaler features: {list(agent.scaler.feature_names_in_)}")
    
    # Check encoder
    if agent.encoder:
        print(f"   Encoder type: {type(agent.encoder).__name__}")
        if hasattr(agent.encoder, 'classes_'):
            print(f"   Encoder classes: {list(agent.encoder.classes_)}")

# Debug all agents
print("🔍 COMPREHENSIVE MODEL DEBUGGING:")
for key, agent in router.agents.items():
    debug_model_features(key, agent)

# Test with minimal data first
def test_minimal_data():
    print("\n🧪 TESTING WITH MINIMAL DATA:")
    
    # Test AIS (this works)
    print("\n1. AIS Test:")
    ais_data = pd.DataFrame([{
        'SOG': 12.3, 'COG': 85.0, 'Heading': 90.0, 
        'Length': 100.0, 'Width': 20.0, 'Draft': 6.0
    }])
    result = router.route_prediction(ais_data, preferred_agent='ais')
    print(f"   Result: {'✅ Success' if result['success'] else '❌ Failed'}")
    if not result['success']:
        print(f"   Error: {result['error']}")
    
    # Test Fishing with exact required features
    print("\n2. Fishing Test:")
    fishing_data = pd.DataFrame([{
        'SOG': 2.5, 'sog_diff': -0.3, 'time_diff': 300.0, 'distance': 45.0
    }])
    
    # Check if fishing agent can handle this
    fishing_agent = router.agents['fishing']
    can_handle = fishing_agent.can_handle_input(fishing_data)
    print(f"   Can handle input: {can_handle}")
    
    # Validate input
    is_valid, message = fishing_agent.validate_input(fishing_data)
    print(f"   Input validation: {is_valid} - {message}")
    
    if is_valid:
        result = fishing_agent.predict(fishing_data)
        print(f"   Direct prediction: {'✅ Success' if result['success'] else '❌ Failed'}")
        if not result['success']:
            print(f"   Error: {result['error']}")
        else:
            print(f"   Prediction: {result['prediction']}")
    
    # Test Kattegat
    print("\n3. Kattegat Test:")
    kattegat_agent = router.agents['kattegat']
    
    # First check what features it actually needs
    required_features = kattegat_agent.get_required_features()
    print(f"   Required features: {required_features}")
    
    # Create test data with only required features
    kattegat_data = pd.DataFrame([{
        'length': 85.0,
        'draught': 5.2,
        'cog': 180.0,
        'heading': 185.0,
        'speed': 8.5,
        'area': 1800.0
    }])
    
    # Check what happens
    can_handle = kattegat_agent.can_handle_input(kattegat_data)
    print(f"   Can handle input: {can_handle}")
    
    is_valid, message = kattegat_agent.validate_input(kattegat_data)
    print(f"   Input validation: {is_valid} - {message}")
    
    if is_valid:
        result = kattegat_agent.predict(kattegat_data)
        print(f"   Direct prediction: {'✅ Success' if result['success'] else '❌ Failed'}")
        if not result['success']:
            print(f"   Error: {result['error']}")
        else:
            print(f"   Prediction: {result['prediction']}")

test_minimal_data()

# Fix the Kattegat model by checking actual training features
def fix_kattegat_test():
    print("\n🔧 FIXING KATTEGAT MODEL:")
    
    kattegat_agent = router.agents['kattegat']
    model = kattegat_agent.model
    
    # If model has feature names, use them
    if hasattr(model, 'feature_names_in_'):
        actual_features = list(model.feature_names_in_)
        print(f"   Model was trained with: {actual_features}")
        
        # Create test data with all required features
        test_data = {}
        for feature in actual_features:
            if feature == 'length':
                test_data[feature] = 85.0
            elif feature == 'draught':
                test_data[feature] = 5.2
            elif feature == 'cog':
                test_data[feature] = 180.0
            elif feature == 'heading':
                test_data[feature] = 185.0
            elif feature == 'speed':
                test_data[feature] = 8.5
            elif feature == 'area':
                test_data[feature] = 1800.0
            elif 'navigationalstatus_' in feature:
                # Set one status to 1, others to 0
                test_data[feature] = 1 if feature == 'navigationalstatus_Engaged in fishing' else 0
            else:
                # Default value for unknown features
                test_data[feature] = 0.0
        
        kattegat_fixed_data = pd.DataFrame([test_data])
        print(f"   Created data with {len(test_data)} features")
        
        # Test with fixed data
        result = kattegat_agent.predict(kattegat_fixed_data)
        print(f"   Fixed prediction: {'✅ Success' if result['success'] else '❌ Failed'}")
        if result['success']:
            print(f"   Prediction: {result['prediction']}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}")
        else:
            print(f"   Error: {result['error']}")
        
        return kattegat_fixed_data
    else:
        print("   ❌ Model doesn't have feature_names_in_ attribute")
        return None

# Try to fix Kattegat
kattegat_fixed = fix_kattegat_test()

# Update the agent's get_required_features method if needed
def update_kattegat_features():
    print("\n🔄 UPDATING KATTEGAT AGENT FEATURES:")
    
    kattegat_agent = router.agents['kattegat']
    model = kattegat_agent.model
    
    if hasattr(model, 'feature_names_in_'):
        # Override the get_required_features method
        actual_features = list(model.feature_names_in_)
        
        # Create a new method
        def get_actual_required_features():
            return actual_features
        
        # Replace the method
        kattegat_agent.get_required_features = get_actual_required_features
        
        print(f"   ✅ Updated required features to: {actual_features[:5]}... (showing first 5)")
        print(f"   Total features: {len(actual_features)}")
        
        return True
    
    return False

# Update and test again
if update_kattegat_features():
    print("\n🧪 TESTING AFTER FEATURE UPDATE:")
    if kattegat_fixed is not None:
        result = router.route_prediction(kattegat_fixed, preferred_agent='kattegat')
        print(f"   Final test: {'✅ Success' if result['success'] else '❌ Failed'}")
        if result['success']:
            print(f"   Prediction: {result['prediction']}")

print("\n✅ Debugging complete!")

# Fishing Agent Specific Debugging Script

def deep_debug_fishing_agent(router):
    """Deep dive into fishing agent issues"""
    print("🎣 DEEP DEBUGGING FISHING AGENT:")
    print("="*50)
    
    fishing_agent = router.agents['fishing']
    
    # Step 1: Examine the agent structure
    print("\n1️⃣ AGENT STRUCTURE:")
    print(f"   Agent name: {fishing_agent.name}")
    print(f"   Agent type: {type(fishing_agent).__name__}")
    print(f"   Has model: {hasattr(fishing_agent, 'model')}")
    print(f"   Has scaler: {hasattr(fishing_agent, 'scaler')}")
    print(f"   Has encoder: {hasattr(fishing_agent, 'encoder')}")
    
    # Step 2: Examine the model
    print("\n2️⃣ MODEL DETAILS:")
    model = fishing_agent.model
    print(f"   Model type: {type(model).__name__}")
    
    if hasattr(model, 'feature_names_in_'):
        features = list(model.feature_names_in_)
        print(f"   Expected features: {features}")
        print(f"   Feature count: {len(features)}")
    
    if hasattr(model, 'n_features_in_'):
        print(f"   n_features_in_: {model.n_features_in_}")
    
    # Step 3: Examine the scaler
    print("\n3️⃣ SCALER DETAILS:")
    if fishing_agent.scaler:
        scaler = fishing_agent.scaler
        print(f"   Scaler type: {type(scaler).__name__}")
        
        # Check if it's actually a scaler or another model
        if hasattr(scaler, 'feature_names_in_'):
            print(f"   Scaler features: {list(scaler.feature_names_in_)}")
        
        # Check XGBoost specific attributes
        if hasattr(scaler, 'feature_importances_'):
            print(f"   Has feature_importances_: True")
        
        if hasattr(scaler, 'get_params'):
            print(f"   Scaler params: {scaler.get_params()}")
    
    # Step 4: Test with actual expected features
    print("\n4️⃣ TESTING WITH ACTUAL FEATURES:")
    
    # Get the actual required features
    actual_features = fishing_agent.get_required_features()
    print(f"   Required features: {actual_features}")
    
    # Create test data with actual features
    test_data = {}
    feature_values = {
        'longitude': 12.5,
        'latitude': 56.2,
        'x': 100.0,
        'y': 200.0,
        'signed_turn': 0.1,
        'bearing': 180.0,
        'time_gap': 300.0,
        'distance_gap': 45.0,
        'euc_speed': 8.5,
        'distanceToShore': 2.5,
        'SOG': 8.5,
        'sog_diff': -0.3,
        'time_diff': 300.0,
        'distance': 45.0
    }
    
    for feature in actual_features:
        if feature in feature_values:
            test_data[feature] = feature_values[feature]
        else:
            test_data[feature] = 0.0
    
    test_df = pd.DataFrame([test_data])
    print(f"   Test data shape: {test_df.shape}")
    print(f"   Test data columns: {list(test_df.columns)}")
    
    # Step 5: Test each component individually
    print("\n5️⃣ COMPONENT TESTING:")
    
    try:
        # Test can_handle_input
        can_handle = fishing_agent.can_handle_input(test_df)
        print(f"   can_handle_input: {can_handle}")
        
        # Test validate_input
        is_valid, message = fishing_agent.validate_input(test_df)
        print(f"   validate_input: {is_valid} - {message}")
        
        if is_valid:
            # Test direct prediction
            print("\n   🔍 Testing direct prediction...")
            result = fishing_agent.predict(test_df)
            print(f"   Direct prediction result: {result}")
            
            if not result['success']:
                print(f"   ❌ Direct prediction failed: {result['error']}")
            else:
                print(f"   ✅ Direct prediction succeeded: {result['prediction']}")
        
    except Exception as e:
        print(f"   ❌ Exception during testing: {str(e)}")
        import traceback
        traceback.print_exc()

def fix_fishing_agent_scaler_issue(router):
    """Fix the fishing agent if the scaler is actually a model"""
    print("\n🔧 FIXING FISHING AGENT SCALER ISSUE:")
    print("="*50)
    
    fishing_agent = router.agents['fishing']
    
    # Check if scaler is actually an XGBoost model
    if hasattr(fishing_agent.scaler, 'feature_importances_'):
        print("   ⚠️  Scaler appears to be an XGBoost model, not a scaler!")
        
        # The scaler might actually be the real model
        # Let's swap them if needed
        if type(fishing_agent.scaler).__name__ == 'XGBClassifier':
            print("   🔄 Swapping model and scaler...")
            
            # Save the original
            original_model = fishing_agent.model
            original_scaler = fishing_agent.scaler
            
            # Swap them
            fishing_agent.model = original_scaler
            fishing_agent.scaler = None  # Or set to StandardScaler if needed
            
            print("   ✅ Model and scaler swapped!")
            
            # Update the required features based on the new model
            if hasattr(fishing_agent.model, 'feature_names_in_'):
                actual_features = list(fishing_agent.model.feature_names_in_)
                
                def get_fixed_features():
                    return actual_features
                
                fishing_agent.get_required_features = get_fixed_features
                print(f"   ✅ Updated required features: {actual_features}")
    
    return fishing_agent

def test_fishing_agent_thoroughly(router):
    """Comprehensive test of fishing agent"""
    print("\n🧪 COMPREHENSIVE FISHING AGENT TEST:")
    print("="*50)
    
    fishing_agent = router.agents['fishing']
    
    # Test with multiple data scenarios
    test_scenarios = [
        {
            'name': 'Scenario 1: Basic fishing behavior',
            'data': {
                'longitude': 12.5,
                'latitude': 56.2,
                'x': 100.0,
                'y': 200.0,
                'signed_turn': 0.1,
                'bearing': 180.0,
                'time_gap': 300.0,
                'distance_gap': 45.0,
                'euc_speed': 2.5,  # Slow speed for fishing
                'distanceToShore': 2.5
            }
        },
        {
            'name': 'Scenario 2: High speed (not fishing)',
            'data': {
                'longitude': 12.6,
                'latitude': 56.3,
                'x': 150.0,
                'y': 250.0,
                'signed_turn': 0.0,
                'bearing': 90.0,
                'time_gap': 120.0,
                'distance_gap': 200.0,
                'euc_speed': 15.0,  # High speed
                'distanceToShore': 5.0
            }
        }
    ]
    
    results = []
    
    for scenario in test_scenarios:
        print(f"\n📊 {scenario['name']}:")
        
        # Create test data
        test_df = pd.DataFrame([scenario['data']])
        
        try:
            # Test through router
            result = router.route_prediction(test_df, preferred_agent='fishing')
            
            if result['success']:
                print(f"   ✅ SUCCESS: {result['prediction']}")
                if result.get('confidence'):
                    print(f"   📊 Confidence: {result['confidence']:.2f}")
                results.append(True)
            else:
                print(f"   ❌ FAILED: {result['error']}")
                results.append(False)
                
        except Exception as e:
            print(f"   ❌ EXCEPTION: {str(e)}")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n📈 Success rate: {success_rate:.1f}% ({sum(results)}/{len(results)})")
    
    return success_rate == 100

# Main function to debug and fix fishing agent
def debug_and_fix_fishing_agent(router):
    """Main function to debug and fix the fishing agent"""
    print("🎣 FISHING AGENT DEBUGGING AND REPAIR")
    print("="*60)
    
    # Step 1: Deep debug
    deep_debug_fishing_agent(router)
    
    # Step 2: Try to fix scaler issue
    fix_fishing_agent_scaler_issue(router)
    
    # Step 3: Test thoroughly
    success = test_fishing_agent_thoroughly(router)
    
    if success:
        print("\n🎉 Fishing agent is now working!")
    else:
        print("\n⚠️  Fishing agent still needs attention.")
        print("   Consider checking the model files and training data.")
    
    return success

# Run the fishing agent specific debugging
if __name__ == "__main__":
    success = debug_and_fix_fishing_agent(router)
    
    if success:
        print("\n✅ Fishing agent debugging complete!")
    else:
        print("\n❌ Fishing agent still has issues - manual inspection needed.")

# Simplified Model Feature Debugging and Fix

def diagnose_agent_features(router):
    """Diagnose feature mismatches in all agents"""
    print("🔍 AGENT FEATURE DIAGNOSIS:")
    print("="*50)
    
    issues = {}
    
    for agent_key, agent in router.agents.items():
        print(f"\n📊 {agent_key.upper()} Agent:")
        
        # Get what agent claims it needs
        claimed_features = agent.get_required_features()
        print(f"   Claimed features: {claimed_features}")
        
        # Get what model actually expects
        model = agent.model
        if hasattr(model, 'feature_names_in_'):
            actual_features = list(model.feature_names_in_)
            print(f"   Model expects: {actual_features}")
            
            # Check for mismatch
            if set(claimed_features) != set(actual_features):
                issues[agent_key] = {
                    'claimed': claimed_features,
                    'actual': actual_features,
                    'missing': [f for f in actual_features if f not in claimed_features],
                    'extra': [f for f in claimed_features if f not in actual_features]
                }
                print(f"   ❌ MISMATCH DETECTED!")
                print(f"   Missing: {issues[agent_key]['missing']}")
                print(f"   Extra: {issues[agent_key]['extra']}")
            else:
                print(f"   ✅ Features match!")
        else:
            print(f"   ⚠️  Model doesn't have feature_names_in_")
    
    return issues

def fix_agent_features(router, issues):
    """Fix feature mismatches by updating agent methods"""
    print("\n🔧 FIXING FEATURE MISMATCHES:")
    print("="*50)
    
    for agent_key, issue_info in issues.items():
        print(f"\n🔄 Fixing {agent_key.upper()} Agent:")
        
        agent = router.agents[agent_key]
        actual_features = issue_info['actual']
        
        # Create a closure to capture the actual features
        def make_fixed_get_required_features(features):
            def get_required_features():
                return features
            return get_required_features
        
        # Replace the method
        agent.get_required_features = make_fixed_get_required_features(actual_features)
        
        print(f"   ✅ Updated required features to match model")
        print(f"   📊 New feature count: {len(actual_features)}")

def create_test_data_for_agent(agent_key, agent):
    """Create proper test data based on actual model requirements"""
    
    # Get actual required features
    required_features = agent.get_required_features()
    
    # Create base test data with reasonable defaults
    test_data = {}
    
    for feature in required_features:
        if feature.lower() in ['sog', 'speed', 'euc_speed']:
            test_data[feature] = 8.5
        elif feature.lower() in ['cog', 'course', 'heading', 'bearing']:
            test_data[feature] = 180.0
        elif feature.lower() in ['length']:
            test_data[feature] = 85.0
        elif feature.lower() in ['width', 'beam']:
            test_data[feature] = 20.0
        elif feature.lower() in ['draft', 'draught']:
            test_data[feature] = 5.2
        elif feature.lower() in ['longitude']:
            test_data[feature] = 12.5
        elif feature.lower() in ['latitude']:
            test_data[feature] = 56.2
        elif feature.lower() in ['x']:
            test_data[feature] = 100.0
        elif feature.lower() in ['y']:
            test_data[feature] = 200.0
        elif feature.lower() in ['area']:
            test_data[feature] = 1800.0
        elif feature.lower() in ['time_diff', 'time_gap']:
            test_data[feature] = 300.0
        elif feature.lower() in ['distance', 'distance_gap']:
            test_data[feature] = 45.0
        elif feature.lower() in ['sog_diff']:
            test_data[feature] = -0.3
        elif feature.lower() in ['signed_turn']:
            test_data[feature] = 0.1
        elif feature.lower() in ['distancetoshore']:
            test_data[feature] = 2.5
        elif 'navigationalstatus_' in feature.lower():
            # One-hot encoded navigational status
            test_data[feature] = 1 if 'fishing' in feature.lower() else 0
        else:
            # Default for unknown features
            test_data[feature] = 0.0
    
    return pd.DataFrame([test_data])

def test_all_agents(router):
    """Test all agents with proper data"""
    print("\n🧪 TESTING ALL AGENTS:")
    print("="*50)
    
    results = {}
    
    for agent_key, agent in router.agents.items():
        print(f"\n📊 Testing {agent_key.upper()} Agent:")
        
        try:
            # Create test data
            test_data = create_test_data_for_agent(agent_key, agent)
            print(f"   Input features: {len(test_data.columns)}")
            
            # Test prediction
            result = router.route_prediction(test_data, preferred_agent=agent_key)
            
            if result['success']:
                print(f"   ✅ SUCCESS!")
                print(f"   🎯 Prediction: {result['prediction']}")
                print(f"   🤖 Agent: {result['agent']}")
                if result.get('confidence'):
                    print(f"   📊 Confidence: {result['confidence']:.2f}")
                results[agent_key] = True
            else:
                print(f"   ❌ FAILED: {result['error']}")
                results[agent_key] = False
                
        except Exception as e:
            print(f"   ❌ EXCEPTION: {str(e)}")
            results[agent_key] = False
    
    return results

# Main debugging and fixing workflow
def debug_and_fix_router(router):
    """Main function to debug and fix the router"""
    print("🚀 STARTING MODEL DEBUGGING AND FIXING")
    print("="*60)
    
    # Step 1: Diagnose issues
    issues = diagnose_agent_features(router)
    
    # Step 2: Fix issues
    if issues:
        fix_agent_features(router, issues)
        print("\n✅ All feature mismatches fixed!")
    else:
        print("\n✅ No feature mismatches found!")
    
    # Step 3: Test all agents
    test_results = test_all_agents(router)
    
    # Step 4: Summary
    print("\n📋 FINAL SUMMARY:")
    print("="*30)
    successful_agents = [k for k, v in test_results.items() if v]
    failed_agents = [k for k, v in test_results.items() if not v]
    
    print(f"✅ Working agents: {successful_agents}")
    if failed_agents:
        print(f"❌ Failed agents: {failed_agents}")
    else:
        print("🎉 All agents are working!")
    
    return len(successful_agents) == len(test_results)

# Run the complete debugging and fixing process
if __name__ == "__main__":
    # Assuming 'router' is your RouterAgent instance
    success = debug_and_fix_router(router)
    
    if success:
        print("\n🎉 Router is now fully functional!")
    else:
        print("\n⚠️  Some agents still need attention.")