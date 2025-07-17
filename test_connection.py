import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code}")
    print(response.json())

def test_prediction():
    data = {
        "vessel_id": "TEST001",
        "latitude": 12.34,
        "longitude": 56.78,
        "speed": 10.5,
        "course": 180.0,
        "vessel_type": "cargo"
    }
    
    response = requests.post(f"{BASE_URL}/api/predict/", json=data)
    print(f"Prediction: {response.status_code}")
    print(response.json())

def test_zone_check():
    data = {
        "latitude": 12.34,
        "longitude": 56.78
    }
    
    response = requests.post(f"{BASE_URL}/api/check-zone/", json=data)
    print(f"Zone check: {response.status_code}")
    print(response.json())

if __name__ == "__main__":
    test_health()
    test_prediction()
    test_zone_check()