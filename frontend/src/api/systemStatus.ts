import { apiClient } from './apiClient';

export async function getSystemStatus() {
  try {
    const [healthStatus, agentInfo, zoneStatus] = await Promise.all([
      apiClient.healthCheck(),
      apiClient.getAgentInfo(),
      apiClient.getZoneStatus()
    ]);

    return {
      health: healthStatus,
      agents: agentInfo,
      zones: zoneStatus,
      overall_status: healthStatus.status === 'healthy' && 
                     agentInfo.success && 
                     zoneStatus.zones_loaded ? 'operational' : 'degraded'
    };
  } catch (error) {
    console.error("System status check error:", error);
    return {
      health: { status: 'error', services: {} },
      agents: { success: false, agents: {} },
      zones: { zones_loaded: false, available_zones: [] },
      overall_status: 'error'
    };
  }
}