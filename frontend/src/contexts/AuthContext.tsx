import React, { createContext, useState, useContext, useEffect } from 'react';
import { blueGuardApi } from '@/api/blueGuardApi';

interface AuthContextType {
    user: any;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing session
        const checkAuth = async () => {
            try {
                const response = await blueGuardApi.getCurrentUser();
                setUser(response);
            } catch (err) {
                // Not logged in - that's okay
            }
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await blueGuardApi.login(username, password);
            setUser(response);
            setError(null);
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const logout = async () => {
        await blueGuardApi.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};