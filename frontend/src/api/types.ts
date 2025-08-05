export interface VesselData {
  vessel_id?: string;
  longitude: number;
  latitude: number;
  SOG?: number;  // Speed Over Ground
  COG?: number;  // Course Over Ground
  heading?: number;
  length?: number;
  width?: number;
  draft?: number;
  behavior?: string;
  timestamp?: string;
  illegal_fishing?: boolean;
  mmsi?: string;
  vessel_type?: string;
  flag?: string;
  risk_score?: number;
  in_mpa?: boolean;
  in_eez?: boolean;
  in_port?: boolean;
  risk_level?: 'low' | 'medium' | 'high';
}

export interface GeoZone {
  type: 'Feature';
  properties: {
    name: string;
    type: 'mpa' | 'eez' | 'port';
    restrictions?: string[];
    description?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][];
  };
}

export interface ZoneCheckRequest {
  vessels: Array<{
    vessel_id?: string;
    latitude: number;
    longitude: number;
  }>;
}

export interface ZoneViolationResult {
  vessel_id: string;
  zone_type: 'mpa' | 'eez';
  timestamp: string;
  location: [number, number];
  duration?: number;
  severity: 'low' | 'medium' | 'high';
  details?: string;
}

export interface ZoneCheckResponse {
  success: boolean;
  total_vessels: number;
  violations: number;
  mpa_violations: number;
  eez_violations: number;
  processing_time: string;
  results: ZoneViolationResult[];
  error?: string;
}

export interface PredictionRequest {
  agent: string;
  data: VesselData[];
  config?: {
    timeframe?: [string, string];
    threshold?: number;
    includeMetadata?: boolean;
  };
}

export interface PredictionResponse {
  success: boolean;
  agent_used: string;
  processing_time: string;
  results: Array<{
    vessel_id: string;
    predictions: Array<{
      behavior: string;
      confidence: number;
      timestamp: string;
    }>;
    metadata?: {
      risk_factors: string[];
      confidence_score: number;
      data_quality: number;
    };
  }>;
  error?: string;
}

export interface ZoneCheckRequest {
  data: VesselData[];
  zones?: {
    mpa?: GeoZone[];
    eez?: GeoZone[];
  };
  config?: {
    strict_mode?: boolean;
    include_history?: boolean;
    time_window?: number;
  };
}

export interface ViolationDetail {
  vessel_id: string;
  zone_type: 'mpa' | 'eez';
  timestamp: string;
  location: [number, number];
  duration?: number;
  severity: 'low' | 'medium' | 'high';
  details?: string;
}

export interface ZoneCheckResponse {
  success: boolean;
  total_vessels: number;
  violations: number;
  mpa_violations: number;
  eez_violations: number;
  processing_time: string;
  results: ViolationDetail[];
  error?: string;
}

export interface AgentInfo {
  name: string;
  purpose: string;
  required_features: string[];
  capabilities: string[];
  performance_metrics?: {
    accuracy: number;
    latency: number;
    last_updated: string;
  };
}

export interface BatchAnalysisRequest {
  vessels: VesselData[];
  analysis_types: ('behavior' | 'risk' | 'violation')[];
  config?: {
    include_history?: boolean;
    risk_threshold?: number;
    time_window?: number;
  };
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
  vessel_details: Array<{
    vessel_id: string;
    risk_score: number;
    violations: ViolationDetail[];
    behavior_analysis: {
      current_behavior: string;
      confidence: number;
      historical_patterns: string[];
    };
    metadata?: {
      data_quality: number;
      analysis_confidence: number;
      last_updated: string;
    };
  }>;
}

export interface ApiErrorResponse {
  detail: string;
  code: string;
  timestamp: string;
  path?: string;
  suggestion?: string;
}

export interface UploadProgressEvent {
  loaded: number;
  total?: number;
  progress: number;
  estimated_time_remaining?: number;
}

export interface ApiConfig {
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  baseURL?: string;
  validateStatus?: (status: number) => boolean;
  withCredentials?: boolean;
}
