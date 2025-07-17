const API_BASE_URL = 'http://localhost:8000/api';

export type ModelType = 'ais' | 'fishing' | 'kattegat';

export interface PredictionRequest {
    model_type: ModelType;
    data: any;  // vessel tracking data
}

export interface VesselData {
    mmsi: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    [key: string]: any;  // additional vessel data fields
}

export interface ViolationCheckRequest {
    vessel_data: VesselData[];
}

export interface PredictionResponse {
    prediction: any;
    model_type: ModelType;
    timestamp: string;
}

export interface ViolationResponse {
    violations: any[];
    timestamp: string;
}

export interface ModelStatus {
    status: {
        ais: boolean;
        fishing: boolean;
        kattegat: boolean;
    };
    timestamp: string;
}

export const blueGuardApi = {
    async predict(request: PredictionRequest): Promise<PredictionResponse> {
        const response = await fetch(`${API_BASE_URL}/predict/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },

    async checkViolation(request: ViolationCheckRequest): Promise<ViolationResponse> {
        const response = await fetch(`${API_BASE_URL}/violation-check/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },

    async getModelStatus(): Promise<ModelStatus> {
        const response = await fetch(`${API_BASE_URL}/model-status/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
};