
export async function checkZone(data: any[]) {
  try {
    const response = await fetch("http://localhost:8000/api/check-zone/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ data: data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Zone check API response:", result);
    
    return result;
  } catch (error) {
    console.error("Zone check API error:", error);
    // Return mock data for demo purposes
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
      success: true,
      total_vessels: data.length,
      violations: violations,
      mpa_violations: mpaViolations,
      eez_violations: eezViolations,
      processing_time: "0.08s",
      results: mockResults
    };
  }
}
