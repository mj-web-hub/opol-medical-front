import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MedicalRecords from './MedicalRecords';
import './Dashboard.css';
import logo from '../assets/images/opol_logo.png';
import axios from 'axios';

const Dashboard = () => {
  const { user: authUser, logout, isLoading: isAuthLoading } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ setIsLoadingRecords] = useState(false);
  const [ setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Define API URL constant to avoid undefined issues
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (authUser) {
      setUserData(authUser);
      console.log("User data loaded:", authUser);
    }
  }, [authUser]);

  const fetchMedicalRecords = async () => {
    if (!userData?.id) return;

    
    setError(null);
    try {
      // Fix the URL path to use the API_URL constant
      const response = await axios.get(
        `${API_URL}/api/medical-records/user/${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log("Medical records fetched:", response.data);
      return response.data;
    } catch (err) {
      console.error("Error fetching medical records:", err);
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Fixed handleLogout function - now handles asynchronous logout properly
  const handleLogout = async () => {
    try {
      // Check if logout is asynchronous (returns a Promise)
      const logoutResult = logout();
      if (logoutResult instanceof Promise) {
        await logoutResult;
      }
      
      // Clear any tokens from localStorage directly to ensure they're removed
      localStorage.removeItem('token');
      
      // Force redirect to login page
      window.location.href = '/login';
      
      // Or use navigate if you prefer, but this might not work correctly if
      // the auth state is still being updated
      // navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if there was an error
      window.location.href = '/login';
    }
  };

  const getProfileImageUrl = () => {
    if (userData?.picture_path) {
      return `${API_URL}/storage/${userData.picture_path}`;
    }
    return null;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'medical-records':
        return (
          <MedicalRecords
            userId={userData?.id}
            onRefresh={fetchMedicalRecords}
          />
        );
      case 'student-profile':
        return (
          <div className="profile-content">
            <h2>Student Profile</h2>
            <div className="profile-details">
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{userData?.name || 'Not Available'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{userData?.email || 'Not Available'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Student ID:</span>
                  <span className="info-value">{userData?.student_id || 'Not Available'}</span>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>Academic Information</h3>
                <div className="info-row">
                  <span className="info-label">Course:</span>
                  <span className="info-value">{userData?.course || 'Not Available'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Year Level:</span>
                  <span className="info-value">{userData?.year_level ? `${userData.year_level}th Year` : 'Not Available'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div className="welcome-banner">
              <h2>Welcome to your Health Dashboard</h2>
              <p>Access and manage your medical information all in one place.</p>
            </div>
            <div className="dashboard-cards">
              <div className="card" onClick={() => setActiveTab('medical-records')}>
                <h3>Medical Records</h3>
                <p>View your medical history.</p>
                <button className="card-button">View Records</button>
              </div>
              <div className="card" onClick={() => setActiveTab('student-profile')}>
                <h3>Student Profile</h3>
                <p>View your student information.</p>
                <button className="card-button">View Profile</button>
              </div>
            </div>
          </>
        );
    }
  };

  if (isAuthLoading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="header-logo" />
          <h1>{process.env.REACT_APP_NAME || 'Health Dashboard'}</h1>
        </div>
        <div className="user-actions">
          <span className="welcome-text">Welcome, {userData?.name || 'Student'}</span>
          <button 
            className="logout-button" 
            onClick={() => setShowLogoutConfirm(true)}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-image">
              {userData?.picture_path ? (
                <img
                  src={getProfileImageUrl()}
                  alt="Profile"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const parent = e.target.parentNode;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.className = 'profile-placeholder';
                      placeholder.textContent = userData?.name ? userData.name.charAt(0).toUpperCase() : 'S';
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              ) : (
                <div className="profile-placeholder">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h3>{userData?.name || 'Student'}</h3>
              <p className="user-role">Student</p>
              <p className="user-details">ID: {userData?.student_id || 'N/A'}</p>
              <p className="user-details">{userData?.course || 'No Course'}</p>
              <p className="user-details">{userData?.year_level ? `${userData.year_level}th Year` : 'Year Not Set'}</p>
            </div>
          </div>

          <nav className="dashboard-nav">
            <ul>
              <li className={activeTab === 'dashboard' ? 'active' : ''}>
                <a href="#dashboard" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
                  Dashboard
                </a>
              </li>
              <li className={activeTab === 'medical-records' ? 'active' : ''}>
                <a href="#medical-records" onClick={(e) => { e.preventDefault(); setActiveTab('medical-records'); }}>
                  Medical Records
                </a>
              </li>
              <li className={activeTab === 'student-profile' ? 'active' : ''}>
                <a href="#student-profile" onClick={(e) => { e.preventDefault(); setActiveTab('student-profile'); }}>
                  Student Profile
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="main-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-confirm-modal">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-button" 
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

export default Dashboard;