import { apiClient } from './apiClient';
import type { ZoneCheckRequest, ZoneCheckResponse } from './types';

export async function checkZone(data: any[]): Promise<ZoneCheckResponse> {
  try {
    const request: ZoneCheckRequest = {
      data: data
    };

    const result = await apiClient.checkZoneViolations(request);
    console.log("Zone check API response:", result);
    
    return result;
  } catch (error) {
    console.error("Zone check API error:", error);
    
    // Return mock data for demo purposes (fallback)
    const mockResults = data.map((vessel, index) => {
      const inMPA = Math.random() > 0.7;
      const inEEZ = Math.random() > 0.5;
      const isFishing = vessel.behavior === 'fishing' || Math.random() > 0.6;
      
      return {
        ...vessel,
        vessel_id: vessel.vessel_id || `VESSEL${String(index + 1).padStart(3, '0')}`,
        in_mpa: inMPA,
        in_eez: inEEZ,
        in_port: Math.random() > 0.9,
        illegal_fishing: inMPA && isFishing,
        risk_level: inMPA && isFishing ? 'high' : inEEZ && isFishing ? 'medium' : 'low'
      };
    });

    const violations = mockResults.filter(r => r.illegal_fishing).length;
    const mpaViolations = mockResults.filter(r => r.in_mpa && r.illegal_fishing).length;
    const eezViolations = mockResults.filter(r => r.in_eez && r.illegal_fishing && !r.in_mpa).length;

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      total_vessels: data.length,
      violations: violations,
      mpa_violations: mpaViolations,
      eez_violations: eezViolations,
      processing_time: "0.00s",
      results: mockResults
    };
  }
}