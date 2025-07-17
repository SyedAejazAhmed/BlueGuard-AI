import { apiClient } from './apiClient';
import type { VesselData, BatchAnalysisResponse } from './types';

export async function analyzeVesselComprehensive(vessel: VesselData) {
  try {
    const result = await apiClient.analyzeVessel(vessel);
    console.log("Comprehensive vessel analysis response:", result);
    return result;
  } catch (error) {
    console.error("Comprehensive vessel analysis error:", error);
    throw error;
  }
}

export async function batchAnalyzeVessels(vessels: any[]): Promise<BatchAnalysisResponse> {
  try {
    const request = { data: vessels };
    const result = await apiClient.batchAnalyze(request);
    console.log("Batch analysis response:", result);
    return result;
  } catch (error) {
    console.error("Batch analysis error:", error);
    throw error;
  }
}