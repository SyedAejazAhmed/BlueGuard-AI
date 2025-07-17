import React, { useState, useEffect } from 'react';
import { blueGuardApi, ModelType, ModelStatus } from '../api/blueGuardApi';

export const PredictionForm: React.FC = () => {
    const [modelType, setModelType] = useState<ModelType>('ais');
    const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
    const [vesselData, setVesselData] = useState<any>(null);
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load model status on component mount
        const loadModelStatus = async () => {
            try {
                const status = await blueGuardApi.getModelStatus();
                setModelStatus(status);
            } catch (err) {
                setError('Failed to load model status');
            }
        };
        loadModelStatus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const result = await blueGuardApi.predict({
                model_type: modelType,
                data: vesselData
            });
            
            setPrediction(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Prediction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="prediction-form">
            <h2>Vessel Behavior Prediction</h2>
            
            {/* Model Status */}
            {modelStatus && (
                <div className="model-status">
                    <h3>Available Models:</h3>
                    <ul>
                        {Object.entries(modelStatus.status).map(([type, available]) => (
                            <li key={type}>
                                {type}: {available ? '✅' : '❌'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                {/* Model Type Selection */}
                <div className="form-group">
                    <label htmlFor="model-type">Model Type:</label>
                    <select 
                        id="model-type"
                        value={modelType}
                        onChange={(e) => setModelType(e.target.value as ModelType)}
                    >
                        <option value="ais">AIS Model</option>
                        <option value="fishing">Fishing Model</option>
                        <option value="kattegat">Kattegat Model</option>
                    </select>
                </div>
                
                {/* Vessel Data Input */}
                <div className="form-group">
                    <label htmlFor="vessel-data">Vessel Data (JSON):</label>
                    <textarea
                        id="vessel-data"
                        value={vesselData ? JSON.stringify(vesselData, null, 2) : ''}
                        onChange={(e) => {
                            try {
                                setVesselData(JSON.parse(e.target.value));
                                setError(null);
                            } catch {
                                setError('Invalid JSON data');
                            }
                        }}
                        rows={10}
                    />
                </div>
                
                {error && <div className="error">{error}</div>}
                
                <button type="submit" disabled={loading || !vesselData}>
                    {loading ? 'Predicting...' : 'Predict'}
                </button>
            </form>
            
            {/* Prediction Results */}
            {prediction && (
                <div className="prediction-results">
                    <h3>Prediction Results:</h3>
                    <pre>{JSON.stringify(prediction, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};