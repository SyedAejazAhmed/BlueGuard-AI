import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { blueGuardApi } from '@/api/blueGuardApi';

export const PredictionForm = () => {
    const { user } = useAuth();
    const [vesselData, setVesselData] = useState({
        mmsi: '',
        timestamp: new Date().toISOString(),
        latitude: '',
        longitude: '',
        speed: '',
        course: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await blueGuardApi.predict({
                model_type: 'ais',
                data: {
                    ...vesselData,
                    user_id: user.id  // Include user ID with prediction request
                }
            });

            // Handle successful prediction
        } catch (error) {
            // Handle error
        }
    };

    // Rest of the component code...
};