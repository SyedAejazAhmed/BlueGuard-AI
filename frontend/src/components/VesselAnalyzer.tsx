import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';

const VesselAnalyzer = () => {
  const [vesselData, setVesselData] = useState({
    vessel_id: '',
    latitude: 0,
    longitude: 0,
    speed: 0,
    course: 0,
    vessel_type: 'cargo'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test backend connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const health = await apiService.healthCheck();
      console.log('Backend connection successful:', health);
    } catch (error) {
      console.error('Backend connection failed:', error.message);
      setError('Cannot connect to backend server');
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call vessel analysis
      const analysisResult = await apiService.analyzeVessel(vesselData);
      setResults(analysisResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call vessel prediction
      const predictionResult = await apiService.predictVessel(vesselData);
      setResults(predictionResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check zone
      const zoneResult = await apiService.checkZone(
        vesselData.latitude, 
        vesselData.longitude
      );
      setResults(zoneResult);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vessel-analyzer">
      <h2>Vessel Analyzer</h2>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      <div className="vessel-form">
        <input
          type="text"
          placeholder="Vessel ID"
          value={vesselData.vessel_id}
          onChange={(e) => setVesselData({...vesselData, vessel_id: e.target.value})}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={vesselData.latitude}
          onChange={(e) => setVesselData({...vesselData, latitude: parseFloat(e.target.value)})}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={vesselData.longitude}
          onChange={(e) => setVesselData({...vesselData, longitude: parseFloat(e.target.value)})}
        />
        <input
          type="number"
          placeholder="Speed (knots)"
          value={vesselData.speed}
          onChange={(e) => setVesselData({...vesselData, speed: parseFloat(e.target.value)})}
        />
        <input
          type="number"
          placeholder="Course (degrees)"
          value={vesselData.course}
          onChange={(e) => setVesselData({...vesselData, course: parseFloat(e.target.value)})}
        />
        <select
          value={vesselData.vessel_type}
          onChange={(e) => setVesselData({...vesselData, vessel_type: e.target.value})}
        >
          <option value="cargo">Cargo</option>
          <option value="fishing">Fishing</option>
          <option value="passenger">Passenger</option>
          <option value="tanker">Tanker</option>
        </select>
      </div>
      
      <div className="action-buttons">
        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Full Analysis'}
        </button>
        <button onClick={handlePredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Only'}
        </button>
        <button onClick={handleZoneCheck} disabled={loading}>
          {loading ? 'Checking...' : 'Check Zone'}
        </button>
      </div>
      
      {results && (
        <div className="results">
          <h3>Results:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default VesselAnalyzer;