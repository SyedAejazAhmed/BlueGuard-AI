import { apiClient } from './apiClient';
import type { ZoneCheckRequest, ZoneCheckResponse, VesselData, ZoneViolationResult } from './types';

function isValidCoordinate(lat: any, lng: any): boolean {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return !isNaN(latitude) && 
         !isNaN(longitude) && 
         latitude >= -90 && 
         latitude <= 90 && 
         longitude >= -180 && 
         longitude <= 180;
}

function generateMockViolation(vessel: VesselData): ZoneViolationResult {
  const zoneType = Math.random() > 0.5 ? 'mpa' : 'eez';
  const severity = Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';
  
  return {
    vessel_id: vessel.vessel_id || 'UNKNOWN',
    zone_type: zoneType,
    timestamp: new Date().toISOString(),
    location: [vessel.longitude, vessel.latitude],
    severity: severity,
    details: `Mock ${zoneType.toUpperCase()} violation`
  };
}

function formatAPIResponse(result: any, vessels: VesselData[]): ZoneCheckResponse {
  if (!result?.results) {
    throw new Error('Invalid API response format');
  }

  return {
    success: true,
    total_vessels: vessels.length,
    violations: result.violations || 0,
    mpa_violations: result.mpa_violations || 0,
    eez_violations: result.eez_violations || 0,
    processing_time: result.processing_time || "0.00s",
    results: result.results.map((v: any): ZoneViolationResult => ({
      vessel_id: v.vessel_id,
      zone_type: v.zone_type || 'mpa',
      timestamp: v.timestamp || new Date().toISOString(),
      location: v.location || [0, 0],
      severity: v.severity || 'low',
      details: v.details || ''
    }))
  };
}

function formatErrorResponse(vessels: VesselData[], error: any): ZoneCheckResponse {
  const mockResults = vessels.map(generateMockViolation);

  return {
    success: false,
    total_vessels: vessels.length,
    violations: mockResults.length,
    mpa_violations: mockResults.filter(r => r.zone_type === 'mpa' && r.severity === 'high').length,
    eez_violations: mockResults.filter(r => r.zone_type === 'eez' && r.severity === 'high').length,
    processing_time: "0.00s",
    results: mockResults,
    error: error instanceof Error ? error.message : 'Unknown error'
  };
}

export async function checkZone(vessels: VesselData[]): Promise<ZoneCheckResponse> {
  try {
    if (!Array.isArray(vessels) || vessels.length === 0) {
      throw new Error("No vessel data to check");
    }

    // Validate and format vessel data
    const vesselRequests = vessels.map((vessel, index) => {
      if (!vessel || !isValidCoordinate(vessel.latitude, vessel.longitude)) {
        throw new Error(`Invalid coordinates in vessel data at index ${index}`);
      }
      return {
        vessel_id: vessel.vessel_id || `VESSEL${String(index + 1).padStart(3, '0')}`,
        latitude: Number(vessel.latitude),
        longitude: Number(vessel.longitude)
      };
    });

    // Make the API request
    const request: ZoneCheckRequest = { vessels: vesselRequests };
    console.log("Sending request to API:", request);
    
    const result = await apiClient.checkZoneViolations(request);
    console.log("Zone check API response:", result);
    
    return formatAPIResponse(result, vessels);

  } catch (error) {
    console.error("Zone check API error:", error);
    return formatErrorResponse(vessels, error);
  }
}
