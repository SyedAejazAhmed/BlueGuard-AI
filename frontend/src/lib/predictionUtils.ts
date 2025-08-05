interface PredictionResult {
  vessel_id: string;
  position: {
    latitude: number;
    longitude: number;
  };
  behavior: string;
  confidence: number;
  risk_level: string;
}

export const formatPredictionResults = (rawData: string): PredictionResult[] => {
  // Split the raw data into lines
  const lines = rawData.split('\n');
  
  // Find the start of the data (after the headers)
  const dataStartIndex = lines.findIndex(line => line.startsWith('Vessel'));
  
  if (dataStartIndex === -1) return [];

  return lines.slice(dataStartIndex).filter(line => line.trim()).map(line => {
    const [vessel_id, position, behavior, confidence, risk_level] = line.split('\t');
    const [lat, lon] = position.split(',').map(coord => parseFloat(coord.trim()));
    
    return {
      vessel_id: vessel_id.trim(),
      position: {
        latitude: lat,
        longitude: lon
      },
      behavior: behavior.trim(),
      confidence: parseFloat(confidence.replace('%', '')),
      risk_level: risk_level.trim()
    };
  });
};
