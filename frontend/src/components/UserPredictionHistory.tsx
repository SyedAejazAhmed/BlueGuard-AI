import React, { useEffect, useState } from 'react';
import { blueGuardApi } from '@/api/blueGuardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const UserPredictionHistory = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await blueGuardApi.getUserPredictions();
                setPredictions(history);
            } catch (error) {
                console.error('Failed to load prediction history:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Prediction History</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Model Type</TableHead>
                            <TableHead>Vessel ID</TableHead>
                            <TableHead>Prediction</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {predictions.map((pred: any) => (
                            <TableRow key={pred.id}>
                                <TableCell>{new Date(pred.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{pred.model_type}</TableCell>
                                <TableCell>{pred.vessel_track.vessel_id}</TableCell>
                                <TableCell>{JSON.stringify(pred.prediction_result)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};