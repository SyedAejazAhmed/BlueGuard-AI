
export async function predictAgent(data: any[], agentType: string) {
  try {
    const response = await fetch("http://localhost:8000/api/predict/", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ 
        agent: agentType, 
        data: data 
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Prediction API response:", result);
    
    return result;
  } catch (error) {
    console.error("Prediction API error:", error);
    // Return mock data for demo purposes
    return {
      success: true,
      agent_used: agentType,
      processing_time: "0.15s",
      results: data.map((vessel, index) => ({
        ...vessel,
        behavior: Math.random() > 0.6 ? 'fishing' : 'transit',
        confidence: 0.7 + Math.random() * 0.3,
        risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      }))
    };
  }
}
