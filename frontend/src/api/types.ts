export interface VesselData {
  vessel_id?: string;
  longitude: number;
  latitude: number;
  SOG?: number;
  COG?: number;
  heading?: number;
  length?: number;
  width?: number;
  draft?: number;
  behavior?: string;
  timestamp?: string;
}

export interface PredictionRequest {
  agent: string;
  data: any[];
}

export interface PredictionResponse {
  success: boolean;
  agent_used?: string;
  processing_time?: string;
  results: any[];
  error?: string;
}

export interface ZoneCheckRequest {
  data: any[];
}

export interface ZoneCheckResponse {
  success: boolean;
  total_vessels: number;
  violations: number;
  mpa_violations: number;
  eez_violations: number;
  processing_time: string;
  results: any[];
  error?: string;
}

export interface AgentInfo {
  name: string;
  purpose: string;
  required_features: string[];
}

export interface BatchAnalysisResponse {
  success: boolean;
  total_vessels: number;
  vessels_analyzed: number;
  processing_time: string;
  zone_analysis: ZoneCheckResponse;
  summary: {
    total_violations: number;
    mpa_violations: number;
    eez_violations: number;
    high_risk_vessels: number;
    medium_risk_vessels: number;
    low_risk_vessels: number;
  };
}
