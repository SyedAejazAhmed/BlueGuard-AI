import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './Config';

// Create axios instance
const axiosInstance = axios.create({
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

export const apiClient = {
  // Health check
  healthCheck: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.HEALTH);
    return response.data;
  },

  // Predict vessel behavior
  predictBehavior: async (requestData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.PREDICT, requestData);
    return response.data;
  },

  // Check zone violations
  checkZoneViolations: async (requestData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.CHECK_ZONE, requestData);
    return response.data;
  },

  // Analyze vessel
  analyzeVessel: async (requestData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.ANALYZE_VESSEL, requestData);
    return response.data;
  },

  // Upload AIS data
  uploadAISData: async (formData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD_AIS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
