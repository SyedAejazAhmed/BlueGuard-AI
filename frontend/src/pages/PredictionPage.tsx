import React from 'react';
import { MapView } from '@/components/MapView';
import { formatPredictionResults } from '@/lib/predictionUtils';

const predictionData = `Prediction Results
AI analysis results using Fishing Agent

Analysis Summary
Vessels Analyzed:4
Agent Used:Fishing Agent
Processing Time:0.00s
Vessel ID	Position	Behavior	Confidence	Risk Level
Vessel 1	55.123456, 12.123456	transit	95.2%	medium
Vessel 2	55.234567, 12.234567	transit	75.1%	medium
Vessel 3	54.345678, 11.345678	transit	81.1%	low
Vessel 4	54.456789, 11.456789	fishing	89.9%	high`;

export default function PredictionPage() {
  const predictions = formatPredictionResults(predictionData);
  
  // Convert predictions to vessel format for the map
  const vessels = predictions.map(pred => ({
    vessel_id: pred.vessel_id,
    latitude: pred.position.latitude,
    longitude: pred.position.longitude,
    behavior: pred.behavior,
    illegal_fishing: pred.risk_level === 'high'
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vessel Predictions</h1>
      <MapView
        vessels={vessels}
        predictions={predictions}
        layers={{
          mpa: true,
          eez: true,
          ports: false
        }}
      />
    </div>
  );
}
