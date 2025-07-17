const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  PREDICT: `${API_BASE_URL}/api/predict/`,
  CHECK_ZONE: `${API_BASE_URL}/api/check-zone/`,
  ANALYZE_VESSEL: `${API_BASE_URL}/api/analyze-vessel/`,
  UPLOAD_AIS: `${API_BASE_URL}/api/upload-ais/`,
  HEALTH: `${API_BASE_URL}/health`,
  AGENTS_INFO: `${API_BASE_URL}/api/agents/info/`,
  ZONES_STATUS: `${API_BASE_URL}/api/zones/status/`,
  BATCH_ANALYZE: `${API_BASE_URL}/api/batch-analyze/`,
};

export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
