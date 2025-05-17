import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Get API URL from environment or fallback to a default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const MedicalRecordsContext = createContext();

export const MedicalRecordsProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Automatically fetch the current user's record when the user changes
    useEffect(() => {
        if (user?.id) {
            getUserRecord(user.id);
        }
    }, [user?.id]);
    
    const getUserRecord = async (userId) => {
        if (!userId) return null;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/medical-records/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const record = response.data;
            console.log("Fetched user medical record:", record);
            
            // Update context state
            setRecords(record);
            return record;
        } catch (err) {
            console.error('Error fetching user record:', err);
            
            // Only set error for non-404 responses
            if (err.response?.status !== 404) {
                setError(err.response?.data?.message || 'Failed to load medical record');
            } else {
                // 404 just means no record exists yet, which is not an error
                setRecords(null);
                console.log("No medical record exists for this user yet");
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };
    
    const fetchAllRecords = async (searchQuery = '') => {
        // This would be for admin/staff users who can see all records
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/medical-records`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { search: searchQuery }
            });
            
            setRecords(response.data);
            return response.data;
        } catch (err) {
            console.error('Error fetching all records:', err);
            setError(err.response?.data?.message || 'Failed to load medical records');
            return [];
        } finally {
            setIsLoading(false);
        }
    };
    
    const createRecord = async (recordData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/medical-records`, recordData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const newRecord = response.data;
            setRecords(newRecord);
            return newRecord;
        } catch (err) {
            console.error('Error creating record:', err);
            setError(err.response?.data?.message || 'Failed to create medical record');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateRecord = async (recordId, recordData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/api/medical-records/${recordId}`, recordData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const updatedRecord = response.data;
            setRecords(updatedRecord);
            return updatedRecord;
        } catch (err) {
            console.error('Error updating record:', err);
            setError(err.response?.data?.message || 'Failed to update medical record');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    
    const deleteRecord = async (recordId) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/medical-records/${recordId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setRecords(null);
            return true;
        } catch (err) {
            console.error('Error deleting record:', err);
            setError(err.response?.data?.message || 'Failed to delete medical record');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <MedicalRecordsContext.Provider 
            value={{
                record: records, // Single record for current user
                isLoading,
                error,
                getUserRecord,
                fetchAllRecords,
                createRecord,
                updateRecord,
                deleteRecord,
                clearError: () => setError(null)
            }}
        >
            {children}
        </MedicalRecordsContext.Provider>
    );
};

// Custom hook to use the medical records context
export const useMedicalRecords = () => useContext(MedicalRecordsContext);