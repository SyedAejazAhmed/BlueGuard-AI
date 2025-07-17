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

// frontend/src/api/apiClient.ts
import { API_ENDPOINTS } from './Config';

class ApiClient {
  private async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; services: any }> {
    return this.request(API_ENDPOINTS.HEALTH);
  }

  async getAgentInfo(): Promise<{ success: boolean; agents: Record<string, AgentInfo> }> {
    return this.request(API_ENDPOINTS.AGENTS_INFO);
  }

  async getZoneStatus(): Promise<{ zones_loaded: boolean; available_zones: string[] }> {
    return this.request(API_ENDPOINTS.ZONES_STATUS);
  }

  async predictBehavior(request: PredictionRequest): Promise<PredictionResponse> {
    return this.request<PredictionResponse>(API_ENDPOINTS.PREDICT, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async checkZoneViolations(request: ZoneCheckRequest): Promise<ZoneCheckResponse> {
    return this.request<ZoneCheckResponse>(API_ENDPOINTS.CHECK_ZONE, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async analyzeVessel(vessel: VesselData): Promise<any> {
    return this.request(API_ENDPOINTS.ANALYZE_VESSEL, {
      method: 'POST',
      body: JSON.stringify(vessel),
    });
  }

  async batchAnalyze(request: ZoneCheckRequest): Promise<BatchAnalysisResponse> {
    return this.request<BatchAnalysisResponse>(API_ENDPOINTS.BATCH_ANALYZE, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiClient = new ApiClient();