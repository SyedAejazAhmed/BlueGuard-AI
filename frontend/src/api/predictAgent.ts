import { apiClient } from './apiClient';
import type { PredictionRequest, PredictionResponse } from './types';

export async function predictAgent(data: any[], agentType: string): Promise<PredictionResponse> {
  try {
    const request: PredictionRequest = {
      agent: agentType,
      data: data
    };

    const result = await apiClient.predictBehavior(request);
    console.log("Prediction API response:", result);
    
    return result;
  } catch (error) {
    console.error("Prediction API error:", error);
    
    // Return mock data for demo purposes (fallback)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      agent_used: agentType,
      processing_time: "0.00s",
      results: data.map((vessel, index) => ({
        ...vessel,
        behavior: Math.random() > 0.6 ? 'fishing' : 'transit',
        confidence: 0.7 + Math.random() * 0.3,
        risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      }))
    };
  }
}
