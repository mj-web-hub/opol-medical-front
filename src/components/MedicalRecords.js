import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MedicalRecords = ({ userId, onRefresh }) => {
  const { user: authUser } = useContext(AuthContext);
  const [medicalData, setMedicalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userName, setUserName] = useState('');
  const [formData, setFormData] = useState({
    chronic_conditions: '',
    previous_illnesses: '',
    surgeries_hospitalizations: '',
    allergies: '',
    immunization_history: '',
    childhood_illnesses: ''
  });

  const effectiveUserId = userId || authUser?.id;

  // Debug state changes
  useEffect(() => {
    console.log("Medical data state changed:", medicalData);
    // Force UI update when medicalData changes to null
    if (medicalData === null) {
      console.log("Medical data is null, UI should show Add button");
    }
  }, [medicalData]);

  // Fetch user name when component mounts or userId changes
  useEffect(() => {
    if (effectiveUserId) {
      loadData();
      fetchUserName();
    } else {
      setIsLoading(false);
      setError('No user ID available');
    }
  }, [effectiveUserId]);

  // New function to fetch user name
  const fetchUserName = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/users/${effectiveUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("User data response:", response.data);
      
      // Assuming the user data has a name field, adjust this based on your API structure
      if (response.data && response.data.data) {
        // Try to get full name first, fall back to individual name components
        const userData = response.data.data;
        if (userData.name) {
          setUserName(userData.name);
        } else if (userData.first_name || userData.last_name) {
          setUserName(`${userData.first_name || ''} ${userData.last_name || ''}`.trim());
        } else if (userData.username) {
          setUserName(userData.username);
        } else {
          setUserName(`User ${effectiveUserId}`); // Fallback
        }
      } else if (response.data) {
        // Direct response structure
        const userData = response.data;
        if (userData.name) {
          setUserName(userData.name);
        } else if (userData.first_name || userData.last_name) {
          setUserName(`${userData.first_name || ''} ${userData.last_name || ''}`.trim());
        } else if (userData.username) {
          setUserName(userData.username);
        } else {
          setUserName(`User ${effectiveUserId}`); // Fallback
        }
      } else {
        setUserName(`User ${effectiveUserId}`); // Fallback
      }
    } catch (err) {
      console.error('Error fetching user name:', err);
      setUserName(`User ${effectiveUserId}`); // Fallback on error
    }
  };

  const loadData = async () => {
    if (!effectiveUserId) {
      console.error("User ID is missing");
      setError('User ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/medical-records/user/${effectiveUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("API Response from loadData:", response.data);

      // More explicit handling of different data formats
      let recordData = null;
      
      if (response.data.data) {
        // If data is nested within a data property
        recordData = response.data.data;
      } else if (response.data) {
        // If data is directly in response
        recordData = response.data;
      }
      
      // Handle both object and array formats
      if (Array.isArray(recordData)) {
        if (recordData.length > 0) {
          recordData = recordData[0]; // Use first item if array
        } else {
          recordData = null;
        }
      }
      
      console.log("Final processed medical data:", recordData);
      
      if (recordData && typeof recordData === 'object' && recordData !== null) {
        setMedicalData(recordData);
        setFormData({
          chronic_conditions: recordData.chronic_conditions || '',
          previous_illnesses: recordData.previous_illnesses || '',
          surgeries_hospitalizations: recordData.surgeries_hospitalizations || '',
          allergies: recordData.allergies || '',
          immunization_history: recordData.immunization_history || '',
          childhood_illnesses: recordData.childhood_illnesses || ''
        });
      } else {
        // Special handling for 404 or empty data
        console.log("No valid medical data found - setting to null");
        setMedicalData(null);
        resetFormData();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      if (err.response?.status === 404) {
        console.log("404 response - setting medicalData to null");
        setMedicalData(null);
        resetFormData();
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      chronic_conditions: '',
      previous_illnesses: '',
      surgeries_hospitalizations: '',
      allergies: '',
      immunization_history: '',
      childhood_illnesses: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let response;
      if (isCreating) {
        console.log("Creating new medical record");
        response = await axios.post(
          `${API_URL}/api/medical-records`,
          { ...formData, user_id: effectiveUserId },
          config
        );
      } else {
        if (!medicalData?.id) {
          throw new Error('Missing medical record ID for update');
        }
        
        console.log(`Updating record with ID: ${medicalData.id}`, formData);
        
        response = await axios.put(
          `${API_URL}/api/medical-records/${medicalData.id}`,
          formData,
          config
        );
      }

      console.log("API response after save:", response.data);
      
      // Try to update the state directly from the response first
      if (response.data && response.data.status === 'success') {
        if (response.data.data && typeof response.data.data === 'object') {
          // If we have data in the response, use it directly
          console.log("Updating state with response data:", response.data.data);
          setMedicalData(response.data.data);
          setFormData({
            chronic_conditions: response.data.data.chronic_conditions || '',
            previous_illnesses: response.data.data.previous_illnesses || '',
            surgeries_hospitalizations: response.data.data.surgeries_hospitalizations || '',
            allergies: response.data.data.allergies || '',
            immunization_history: response.data.data.immunization_history || '',
            childhood_illnesses: response.data.data.childhood_illnesses || ''
          });
        } else {
          // If no data in response, reload from API
          console.log("No data in response or invalid format, reloading from API");
          await loadData();
        }
      } else {
        // Fallback - always reload data if we can't update from response
        console.log("Fallback: reloading data from API");
        await loadData();
      }
      
      setIsEditing(false);
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving record:', err);
      setError(err.response?.data?.message ||
        `Failed to ${isCreating ? 'create' : 'update'} record`);
      // Even on error, try to reload data to ensure UI is in sync
      await loadData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!medicalData?.id) {
        throw new Error('No medical record to delete');
      }

      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/medical-records/${medicalData.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Delete response:", response.data);
      
      // Explicitly set medical data to null to trigger UI update
      setMedicalData(null);
      setShowDeleteConfirm(false);
      resetFormData();
      
      // Force UI update by reloading data
      await loadData();
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      setError(err.response?.data?.message || 'Failed to delete record');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(true);
    resetFormData();
  };

  if (isLoading) {
    return <div className="loading">Loading medical records...</div>;
  }

  if (error && error !== 'No user ID available') {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Records</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!effectiveUserId) {
    return (
      <div className="no-user-error">
        <p>Cannot display medical records. User ID is not available.</p>
      </div>
    );
  }

  return (
    <div className="medical-records-container">
      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete your medical record?</p>
            <div className="delete-confirmation-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={handleDeleteRecord}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="medical-records-header">
        <h2>
          Past Medical History 
          {userName && <span className="user-name-display"> - {userName}</span>}
        </h2>
        {!isEditing && (
          <div className="action-buttons">
            {medicalData ? (
              <>
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                >
                  Edit Record
                </button>
                <button
                  className="delete-button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete Record
                </button>
              </>
            ) : (
              <button
                className="add-button"
                onClick={handleCreateNew}
                disabled={isLoading}
              >
                Add Medical Record
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="medical-records-form">
          <div className="form-group">
            <label htmlFor="chronic_conditions">Chronic Conditions:</label>
            <textarea
              id="chronic_conditions"
              name="chronic_conditions"
              value={formData.chronic_conditions}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="previous_illnesses">Previous Illnesses:</label>
            <textarea
              id="previous_illnesses"
              name="previous_illnesses"
              value={formData.previous_illnesses}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="surgeries_hospitalizations">Surgeries/Hospitalizations:</label>
            <textarea
              id="surgeries_hospitalizations"
              name="surgeries_hospitalizations"
              value={formData.surgeries_hospitalizations}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="allergies">Allergies:</label>
            <textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="immunization_history">Immunization History:</label>
            <textarea
              id="immunization_history"
              name="immunization_history"
              value={formData.immunization_history}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="childhood_illnesses">Childhood Illnesses:</label>
            <textarea
              id="childhood_illnesses"
              name="childhood_illnesses"
              value={formData.childhood_illnesses}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                loadData(); // Reload data on cancel
              }}
              className="cancel-button"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : medicalData ? (
        <div className="medical-records-display">
          <div className="record-item">
            <strong>Chronic Conditions:</strong>
            <p>{medicalData.chronic_conditions || 'No information provided.'}</p>
          </div>
          <div className="record-item">
            <strong>Previous Illnesses:</strong>
            <p>{medicalData.previous_illnesses || 'No information provided.'}</p>
          </div>
          <div className="record-item">
            <strong>Surgeries/Hospitalizations:</strong>
            <p>{medicalData.surgeries_hospitalizations || 'No information provided.'}</p>
          </div>
          <div className="record-item">
            <strong>Allergies:</strong>
            <p>{medicalData.allergies || 'No information provided.'}</p>
          </div>
          <div className="record-item">
            <strong>Immunization History:</strong>
            <p>{medicalData.immunization_history || 'No information provided.'}</p>
          </div>
          <div className="record-item">
            <strong>Childhood Illnesses:</strong>
            <p>{medicalData.childhood_illnesses || 'No information provided.'}</p>
          </div>
        </div>
      ) : (
        <div className="no-records">
          <p>No medical records found for {userName || `User ${effectiveUserId}`}.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;