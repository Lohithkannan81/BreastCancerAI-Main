import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, Report, AnalysisStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DataContextType {
    patients: Patient[];
    reports: Report[];
    addPatient: (patient: Omit<Patient, 'registeredDate'>) => void;
    addReport: (report: Omit<Report, 'id' | 'date' | 'status'>) => void;
    getPatientReports: (patientId: string) => Report[];
    getPatient: (patientId: string) => Patient | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider: React.FC<{ children: ReactNode; userId?: string }> = ({ children, userId }) => {
    // Initialize state
    const [patients, setPatients] = useState<Patient[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load data when userId changes
    useEffect(() => {
        console.log('🔄 DataContext: userId changed to:', userId);
        setIsInitialized(false); // Reset on user change

        if (!userId) {
            console.log('🚪 DataContext: User logged out, clearing state');
            // Clear state when user logs out
            setPatients([]);
            setReports([]);
            return;
        }

        const loadData = async () => {
            try {
                // Fetch History
                const hRes = await fetch(`${API_URL}/history/${userId}`);
                if (hRes.ok) {
                    const data = await hRes.json();
                    setReports(data.map((r: any) => ({
                        id: r.id,
                        patientId: r.patient_id,
                        patientName: 'Clinical Patient',
                        date: r.timestamp,
                        tumorClass: r.result,
                        confidence: r.confidence,
                        explanation: r.explanation,
                        status: AnalysisStatus.COMPLETED
                    })));
                }

                // Fetch Patients
                const pRes = await fetch(`${API_URL}/patients/${userId}`);
                if (pRes.ok) {
                    const data = await pRes.json();
                    setPatients(data.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        age: p.age,
                        contact: p.contact,
                        history: p.history,
                        registeredDate: new Date().toISOString()
                    })));
                }

                setIsInitialized(true);
            } catch (e) {
                console.error("Failed to load user data", e);
                setIsInitialized(true);
            }
        };

        loadData();
    }, [userId]);

    // Save to localStorage whenever state changes (only after initialization)
    useEffect(() => {
        if (!userId || !isInitialized) return;

        try {
            const key = `patients_${userId}`;
            console.log('💾 Saving patients to:', key, patients.length, 'items');
            localStorage.setItem(key, JSON.stringify(patients));
        } catch (e) {
            console.error("Failed to save patients", e);
        }
    }, [patients, userId, isInitialized]);

    useEffect(() => {
        if (!userId || !isInitialized) return;

        try {
            const key = `reports_${userId}`;
            console.log('💾 Saving reports to:', key, reports.length, 'items');
            localStorage.setItem(key, JSON.stringify(reports));
        } catch (e) {
            console.error("Failed to save reports - Storage Full", e);
            // Fallback: Try saving without the Base64 images
            try {
                const lightweightReports = reports.map(r => {
                    const { imageUrl, ...rest } = r;
                    return rest;
                });
                localStorage.setItem(`reports_${userId}`, JSON.stringify(lightweightReports));
                console.warn("Saved reports without images due to storage limits.");
            } catch (retryError) {
                console.error("Critical: Could not save reports even without images.", retryError);
            }
        }
    }, [reports, userId, isInitialized]);

    const addPatient = async (p: Omit<Patient, 'registeredDate'>) => {
        try {
            await fetch(`${API_URL}/patients?username=${userId}&patient_id=${p.id}&name=${p.name}&age=${p.age}&contact=${p.contact}&history=${p.history}`, {
                method: 'POST'
            });
            setPatients(prev => [...prev, { ...p, registeredDate: new Date().toISOString() }]);
        } catch (e) {
            console.error("Failed to add patient to API", e);
        }
    };

    const addReport = (reportData: Omit<Report, 'id' | 'date' | 'status'>) => {
        // Reports are added via the /predict API call in NewAnalysis.tsx
        // Here we just update local state for immediate feedback
        const newReport: Report = {
            ...reportData,
            id: `AN-${Math.floor(Math.random() * 10000)}`,
            date: new Date().toISOString().split('T')[0],
            status: AnalysisStatus.COMPLETED
        };
        setReports(prev => [newReport, ...prev]);
    };

    const getPatientReports = (patientId: string) => {
        return reports.filter(r => r.patientId === patientId);
    };

    const getPatient = (patientId: string) => {
        return patients.find(p => p.id === patientId);
    };

    return (
        <DataContext.Provider value={{ patients, reports, addPatient, addReport, getPatientReports, getPatient }}>
            {children}
        </DataContext.Provider>
    );
};
