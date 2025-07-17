const API_BASE_URL = 'http://localhost:8000/api';

export type ModelType = 'ais' | 'fishing' | 'kattegat';

export interface User {
    id: number;
    username: string;
    email: string;
    lastLogin: string;
}

export interface VesselData {
    mmsi: string;
    timestamp: string;
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    draft?: number;
    heading?: number;
}

export interface PredictionRequest {
    model_type: ModelType;
    data: VesselData | VesselData[];
    user_id?: number;
}

export interface PredictionResponse {
    prediction: any;
    model_type: ModelType;
    timestamp: string;
    track_id: number;
    prediction_id: number;
}

export interface PredictionHistory {
    id: number;
    user_id: number;
    vessel_track: VesselData;
    model_type: ModelType;
    prediction_result: any;
    timestamp: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export const blueGuardApi = {
    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        return await response.json();
    },

    async logout(): Promise<void> {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            credentials: 'include',
        });
    },

    async getCurrentUser(): Promise<User> {
        const response = await fetch(`${API_BASE_URL}/auth/me/`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Not authenticated');
        }

        return await response.json();
    },

    async predict(request: PredictionRequest): Promise<PredictionResponse> {
        const response = await fetch(`${API_BASE_URL}/predict/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Prediction failed: ${response.statusText}`);
        }

        return await response.json();
    },

    async getUserPredictions(): Promise<PredictionHistory[]> {
        const response = await fetch(`${API_BASE_URL}/predictions/history/`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch prediction history');
        }

        return await response.json();
    },

    async getModelStatus(): Promise<{ status: Record<ModelType, boolean> }> {
        const response = await fetch(`${API_BASE_URL}/model-status/`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch model status');
        }

        return await response.json();
    },
};