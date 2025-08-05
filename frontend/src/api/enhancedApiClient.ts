import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from './Config';
import {
  VesselData,
  PredictionRequest,
  PredictionResponse,
  ZoneCheckRequest,
  ZoneCheckResponse,
  BatchAnalysisRequest,
  BatchAnalysisResponse,
  ApiErrorResponse,
  UploadProgressEvent
} from './types';

// API configuration
const API_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 5000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  DEFAULT_TIMEOUT: 30000,    // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Simple cache implementation
class ApiCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  set(key: string, data: any, ttl: number = API_CONFIG.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Custom error class with enhanced features
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public timestamp: string = new Date().toISOString(),
    public path?: string,
    public suggestion?: string
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    // Add user-friendly suggestions based on error type
    if (!this.suggestion) {
      this.suggestion = this.getDefaultSuggestion();
    }
  }

  private getDefaultSuggestion(): string {
    switch (this.status) {
      case 400:
        return 'Please check your input data and try again';
      case 401:
        return 'Please log in and try again';
      case 403:
        return 'You don\'t have permission to perform this action';
      case 404:
        return 'The requested resource could not be found';
      case 429:
        return 'Please wait a moment and try again';
      case 500:
        return 'This is a server error. Please try again later or contact support if the problem persists';
      default:
        return 'Please try again or contact support if the problem persists';
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      timestamp: this.timestamp,
      path: this.path,
      suggestion: this.suggestion,
    };
  }
}

// Create axios instance with interceptors
const axiosInstance = axios.create({
  timeout: API_CONFIG.DEFAULT_TIMEOUT,
  headers: API_CONFIG.headers,
});

// Request interceptor for logging and request validation
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request (in development)
    if (process.env.NODE_ENV === 'development') {
      console.debug('API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;

    // Create a user-friendly error message
    let message = 'An unexpected error occurred';
    if (status === 404) {
      message = 'The requested resource was not found';
    } else if (status === 400) {
      message = data?.detail || 'Invalid request';
    } else if (status === 401) {
      message = 'Unauthorized access';
    } else if (status === 403) {
      message = 'Access forbidden';
    } else if (status === 429) {
      message = 'Too many requests, please try again later';
    } else if (status >= 500) {
      message = 'Server error, please try again later';
    }

    return Promise.reject(new ApiError(message, status, data?.code));
  }
);

// Retry logic with exponential backoff
const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = API_CONFIG.MAX_RETRIES,
  delay = API_CONFIG.INITIAL_RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    // Don't retry on certain status codes or after max retries
    if (error.status === 400 || error.status === 401 || error.status === 403 || retries <= 0) {
      throw error;
    }

    // Log retry attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Retrying request. Attempts remaining: ${retries - 1}`);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(
      fn,
      retries - 1,
      Math.min(delay * 2, API_CONFIG.MAX_RETRY_DELAY)
    );
  }
};

// Validation functions
const validateVesselData = (data: any[]): boolean => {
  return Array.isArray(data) && data.every(vessel => 
    vessel &&
    typeof vessel.latitude === 'number' &&
    typeof vessel.longitude === 'number' &&
    vessel.latitude >= -90 &&
    vessel.latitude <= 90 &&
    vessel.longitude >= -180 &&
    vessel.longitude <= 180
  );
};

// Initialize cache
const apiCache = new ApiCache();

// Enhanced API client with retry logic, validation, and caching
export const enhancedApiClient = {
  // Clear cache
  clearCache: () => apiCache.clear(),

  // Health check
  healthCheck: async () => {
    const cacheKey = 'health-check';
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const data = await retryRequest(() => 
      axiosInstance.get(API_ENDPOINTS.HEALTH)
        .then(response => response.data)
    );
    
    apiCache.set(cacheKey, data, 30000); // Cache for 30 seconds
    return data;
  },

  // Predict vessel behavior
  predictBehavior: async (request: PredictionRequest): Promise<PredictionResponse> => {
    return retryRequest(() => 
      axiosInstance.post(API_ENDPOINTS.PREDICT, request)
        .then(response => response.data)
    );
  },

  // Check zone violations
  checkZoneViolations: async (request: ZoneCheckRequest): Promise<ZoneCheckResponse> => {
    return retryRequest(() => 
      axiosInstance.post(API_ENDPOINTS.CHECK_ZONE, request)
        .then(response => response.data)
    );
  },

  // Analyze vessel with caching
  analyzeVessel: async (vesselId: string, data: VesselData[]): Promise<any> => {
    const cacheKey = `vessel-analysis-${vesselId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const result = await retryRequest(() => 
      axiosInstance.post(API_ENDPOINTS.ANALYZE_VESSEL, { vessel_id: vesselId, data })
        .then(response => response.data)
    );

    apiCache.set(cacheKey, result, API_CONFIG.CACHE_TTL);
    return result;
  },

  // Batch analysis
  batchAnalyze: async (request: BatchAnalysisRequest): Promise<BatchAnalysisResponse> => {
    return retryRequest(() => 
      axiosInstance.post(API_ENDPOINTS.BATCH_ANALYZE, request)
        .then(response => response.data)
    );
  },

  // Upload AIS data with progress tracking and validation
  uploadAISData: async (
    formData: FormData, 
    onProgress?: (event: UploadProgressEvent) => void
  ): Promise<{ success: boolean; message: string; data: VesselData[] }> => {
    return retryRequest(() => 
      axiosInstance.post(API_ENDPOINTS.UPLOAD_AIS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = (progressEvent.loaded * 100) / progressEvent.total;
            const event: UploadProgressEvent = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              progress: Math.round(progress),
              estimated_time_remaining: calculateEstimatedTime(progressEvent)
            };
            onProgress(event);
          }
        },
      }).then(response => response.data)
    );
  },

  // Fetch and validate CSV data with caching
  fetchCSV: async (url: string): Promise<VesselData[]> => {
    const cacheKey = `csv-${url}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return cached;

    const response = await retryRequest(() => 
      axiosInstance.get(API_ENDPOINTS.FETCH_CSV, {
        params: { url },
      })
    );
    
    const data = response.data.csv_data;
    if (!validateVesselData(data)) {
      throw new ApiError(
        'Invalid vessel data format in CSV',
        400,
        'INVALID_DATA_FORMAT',
        undefined,
        url,
        'Please ensure the CSV file contains required vessel data fields in the correct format'
      );
    }
    
    apiCache.set(cacheKey, data);
    return data;
  },
};

// Helper function to calculate estimated remaining time
function calculateEstimatedTime(progressEvent: any): number {
  if (!progressEvent.total || !progressEvent.loaded || progressEvent.loaded === 0) {
    return 0;
  }

  const speed = progressEvent.loaded / ((Date.now() - progressEvent.timeStamp) / 1000); // bytes per second
  const remaining = (progressEvent.total - progressEvent.loaded) / speed;
  return Math.round(remaining);
}

export default enhancedApiClient;
