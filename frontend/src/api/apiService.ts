import axios from 'axios';
import { API_ENDPOINTS, API_CONFIG } from './Config';

// Create axios instance
const apiClient = axios.create({
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Vessel prediction
  predictVessel: async (vesselData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.PREDICT, {
        vessel_id: vesselData.vessel_id,
        latitude: vesselData.latitude,
        longitude: vesselData.longitude,
        speed: vesselData.speed,
        course: vesselData.course,
        vessel_type: vesselData.vessel_type,
        timestamp: vesselData.timestamp
      });
      return response.data;
    } catch (error) {
      throw new Error(`Prediction failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Zone checking
  checkZone: async (latitude, longitude) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CHECK_ZONE, {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      throw new Error(`Zone check failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Vessel analysis
  analyzeVessel: async (vesselData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ANALYZE_VESSEL, {
        vessel_id: vesselData.vessel_id,
        latitude: vesselData.latitude,
        longitude: vesselData.longitude,
        speed: vesselData.speed,
        course: vesselData.course,
        vessel_type: vesselData.vessel_type,
        timestamp: vesselData.timestamp
      });
      return response.data;
    } catch (error) {
      throw new Error(`Vessel analysis failed: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Upload AIS data
  uploadAISData: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(API_ENDPOINTS.UPLOAD_AIS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`File upload failed: ${error.response?.data?.detail || error.message}`);
    }
  },
};