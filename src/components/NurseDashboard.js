import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './NurseDashboard.css'; // Import the CSS file

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/medical-records', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRecords(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch medical records');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const hasMatchingUserId = record.user_id && record.user_id.toString().includes(searchTerm);
    const hasMatchingAllergies = record.allergies && record.allergies.toLowerCase().includes(searchTerm.toLowerCase());
    const hasMatchingConditions = record.chronic_conditions && record.chronic_conditions.toLowerCase().includes(searchTerm.toLowerCase());
    
    return hasMatchingUserId || hasMatchingAllergies || hasMatchingConditions;
  });

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-message">Loading medical records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error Loading Records</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-records-container">
      <h2>Medical Records</h2>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by user ID, allergies, or conditions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {records.length === 0 ? (
        <div className="no-records-message">
          <p>No medical records available.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Chronic Conditions</th>
                <th>Allergies</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.user_id}</td>
                  <td>{record.chronic_conditions || 'None'}</td>
                  <td>{record.allergies || 'None'}</td>
                  <td>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleViewDetails(record)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Medical Record Details - User ID: {selectedRecord.user_id}</h3>
              <button 
                className="close-button"
                onClick={handleCloseDetails}
              >
                &times;
              </button>
            </div>
            
            <div className="record-details-grid">
              <div className="detail-card">
                <h4>Chronic Conditions</h4>
                <p>{selectedRecord.chronic_conditions || 'None recorded'}</p>
              </div>
              <div className="detail-card">
                <h4>Previous Illnesses</h4>
                <p>{selectedRecord.previous_illnesses || 'None recorded'}</p>
              </div>
              <div className="detail-card">
                <h4>Surgeries & Hospitalizations</h4>
                <p>{selectedRecord.surgeries_hospitalizations || 'None recorded'}</p>
              </div>
              <div className="detail-card">
                <h4>Allergies</h4>
                <p>{selectedRecord.allergies || 'None recorded'}</p>
              </div>
              <div className="detail-card">
                <h4>Immunization History</h4>
                <p>{selectedRecord.immunization_history || 'None recorded'}</p>
              </div>
              <div className="detail-card">
                <h4>Childhood Illnesses</h4>
                <p>{selectedRecord.childhood_illnesses || 'None recorded'}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={handleCloseDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NurseProfile = ({ user }) => {
  return (
    <div className="profile-container">
      <h2>Nurse Profile</h2>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
          </div>
          <div className="profile-title">
            <h3>{user?.name || 'Nurse'}</h3>
            <p>Registered Nurse</p>
          </div>
        </div>
        
        <div className="profile-details">
          <div className="detail-group">
            <h4>Personal Information</h4>
            <div className="detail-item">
              <span className="detail-label">Full Name:</span>
              <span className="detail-value">{user?.name || 'Not available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email || 'Not available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">License Number:</span>
              <span className="detail-value">{user?.license_number || 'Not available'}</span>
            </div>
          </div>
          
          <div className="detail-group">
            <h4>Professional Details</h4>
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{user?.department || 'Not available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Specialization:</span>
              <span className="detail-value">{user?.specialization || 'Not available'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Years of Experience:</span>
              <span className="detail-value">{user?.years_experience ? `${user.years_experience} years` : 'Not available'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NurseDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.profile-container') === null) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'nurse-profile':
        return <NurseProfile user={user} />;
      case 'medical-records':
        return <MedicalRecords />;
      default:
        return (
          <div className="dashboard-home">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <button
                onClick={() => setActiveTab('medical-records')}
                className="btn btn-primary"
              >
                View Medical Records
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Nurse Admin Dashboard</h1>
          <div className="profile-container">
            <button 
              className="profile-button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              aria-expanded={showProfileDropdown}
            >
              <div className="avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
              </div>
              <span className="username">
                {user?.name || 'Nurse'}
              </span>
              <span className={`dropdown-arrow ${showProfileDropdown ? 'open' : ''}`}>▼</span>
            </button>
            
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
                  </div>
                  <div className="dropdown-user-info">
                    <h4>{user?.name || 'Nurse'}</h4>
                    <p>License: {user?.license_number || 'N/A'}</p>
                    <p>{user?.email || ''}</p>
                  </div>
                </div>
                <div className="dropdown-options">
                  <button 
                    className="dropdown-option"
                    onClick={() => {
                      setActiveTab('nurse-profile');
                      setShowProfileDropdown(false);
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="option-icon">
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/>
                      <path d="M19.4 15C19.2669 15.3016 19.227 15.6363 19.2886 15.9606C19.3502 16.2849 19.5089 16.5814 19.74 16.81L19.79 16.86C19.9765 17.0465 20.1239 17.2686 20.2241 17.5136C20.3243 17.7586 20.3752 18.0215 20.374 18.2869C20.3728 18.5523 20.3195 18.8148 20.2171 19.0588C20.1147 19.3028 19.9653 19.5234 19.777 19.7079C19.5887 19.8924 19.3653 20.0373 19.1203 20.1343C18.8753 20.2313 18.6137 20.2784 18.35 20.2729H5.65001C5.11958 20.2729 4.61087 20.0622 4.2358 19.6871C3.86072 19.312 3.65001 18.8033 3.65001 18.2729C3.65001 17.7425 3.86072 17.2338 4.2358 16.8587C4.61087 16.4836 5.11958 16.2729 5.65001 16.2729H5.66001C5.89113 16.0433 6.04983 15.7468 6.11139 15.4225C6.17295 15.0982 6.13307 14.7635 6.00001 14.462"/>
                    </svg>
                    Nurse Profile
                  </button>
                  <button 
                    className="dropdown-option logout-option"
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setShowProfileDropdown(false);
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="option-icon">
                      <path d="M13 12H22M22 12L18.6667 8M22 12L18.6667 16"/>
                      <path d="M14 7V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H12C12.5304 21 13.0391 20.7893 13.4142 20.4142C13.7893 20.0391 14 19.5304 14 19V17"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className="sidebar-info">
              <h3>{user?.name || 'Nurse'}</h3>
              <p>Registered Nurse</p>
              <p>License: {user?.license_number || 'N/A'}</p>
              <p>{user?.email || ''}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"/>
                <path d="M9 22V12H15V22"/>
              </svg>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('medical-records')}
              className={`nav-item ${activeTab === 'medical-records' ? 'active' : ''}`}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/>
                <path d="M14 2V8H20"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H9H8"/>
              </svg>
              Medical Records
            </button>
            <button
              onClick={() => setActiveTab('nurse-profile')}
              className={`nav-item ${activeTab === 'nurse-profile' ? 'active' : ''}`}
            >
              <svg className="nav-icon" viewBox="0 0 24 24">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/>
                <path d="M19.4 15C19.2669 15.3016 19.227 15.6363 19.2886 15.9606C19.3502 16.2849 19.5089 16.5814 19.74 16.81L19.79 16.86C19.9765 17.0465 20.1239 17.2686 20.2241 17.5136C20.3243 17.7586 20.3752 18.0215 20.374 18.2869C20.3728 18.5523 20.3195 18.8148 20.2171 19.0588C20.1147 19.3028 19.9653 19.5234 19.777 19.7079C19.5887 19.8924 19.3653 20.0373 19.1203 20.1343C18.8753 20.2313 18.6137 20.2784 18.35 20.2729H5.65001C5.11958 20.2729 4.61087 20.0622 4.2358 19.6871C3.86072 19.312 3.65001 18.8033 3.65001 18.2729C3.65001 17.7425 3.86072 17.2338 4.2358 16.8587C4.61087 16.4836 5.11958 16.2729 5.65001 16.2729H5.66001C5.89113 16.0433 6.04983 15.7468 6.11139 15.4225C6.17295 15.0982 6.13307 14.7635 6.00001 14.462"/>
              </svg>
              Nurse Profile
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content logout-confirm">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;