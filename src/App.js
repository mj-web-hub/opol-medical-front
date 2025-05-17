import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Dashboard from './components/Dashboard';
import NurseDashboard from './components/NurseDashboard';
import StudentsManagement from './components/StudentsManagement';
import NurseMedicalRecords from './components/NurseMedicalRecords';
import RegisterNurse from './components/RegisterNurse';
import AddEditStudent from './components/AddEditStudent';
import AddEditMedicalRecord from './components/AddEditMedicalRecord';

import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const user = JSON.parse(localStorage.getItem('user'));

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Nurse Routes */}
          <Route
            path="/nurse-dashboard"
            element={
              <ProtectedRoute requiredRole="nurse">
                <NurseDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/students"
            element={
              <ProtectedRoute requiredRole="nurse">
                <StudentsManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/students/add"
            element={
              <ProtectedRoute requiredRole="nurse">
                <AddEditStudent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/students/edit/:id"
            element={
              <ProtectedRoute requiredRole="nurse">
                <AddEditStudent />
              </ProtectedRoute>
            }
          />

       <Route
  path="/nurse/medical-records"
  element={
    <ProtectedRoute requiredRole="nurse">
      <NurseMedicalRecords />
    </ProtectedRoute>
  }
/>
          <Route
            path="/nurse/medical-records/:studentId"
            element={
              <ProtectedRoute requiredRole="nurse">
                <NurseMedicalRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/medical-records/:studentId/add"
            element={
              <ProtectedRoute requiredRole="nurse">
                <AddEditMedicalRecord />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/medical-records/:studentId/edit/:recordId"
            element={
              <ProtectedRoute requiredRole="nurse">
                <AddEditMedicalRecord />
              </ProtectedRoute>
            }
          />

            <Route
            path="/nurse/medical-records/:studentId/view/:recordId"
            element={
              <ProtectedRoute requiredRole="nurse">
                <AddEditMedicalRecord />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/register"
            element={
              <ProtectedRoute requiredRole="nurse">
                <RegisterNurse />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;