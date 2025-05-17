import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import studentIcon from '../assets/images/student-icon.png';
import nurseIcon from '../assets/images/nurse-icon.png';
import './LoginScreen.css';

const LoginScreen = () => {
  // 🔧 Step 1: Add State for Form Data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',   // Default role
  });
  const [errors, setErrors] = useState({});
  const { login, isLoading, error, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
 useEffect(() => {
  if (isAuthenticated) {
    const targetPath = formData.role === 'nurse' ? '/nurse-dashboard' : '/dashboard';
    if (window.location.pathname !== targetPath) {
      navigate(targetPath);
    }
  }
}, [isAuthenticated, navigate, formData.role]);

  // Clear form-specific errors when input changes
  useEffect(() => {
    if (errors.email && formData.email) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.email;
        return newErrors;
      });
    }
    if (errors.password && formData.password) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.password;
        return newErrors;
      });
    }
  }, [formData.email, formData.password, errors]);

  // 📝 Step 2: Define the Role Change Function
  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  // 🔗 Step 4: Update the Handle Submit Logic
  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});

  // Validate inputs
  if (!formData.email.trim()) {
    setErrors(prev => ({...prev, email: 'Email is required'}));
    return;
  }
  if (!formData.password) {
    setErrors(prev => ({...prev, password: 'Password is required'}));
    return;
  }

  try {
    await login(formData.email, formData.password);
    // Navigation will be handled by the useEffect
  } catch (err) {
    // Errors are already handled in AuthContext
  }
};

  // Create a combined error message from both sources
  const errorMessage = errors.general || error;

  return (
    <div className="login-container">
      <div className="login-inner-container">
        <h1 className="login-title">Medical System Login</h1>

        {errorMessage && <div className="error-banner">{errorMessage}</div>}

        {/* 💻 Step 3: Update Your Form with Role Selection (HTML/JSX) */}
        <div className="role-selection">
          <button
            type="button"
            className={`role-button ${formData.role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-button ${formData.role === 'nurse' ? 'active' : ''}`}
            onClick={() => handleRoleChange('nurse')}
          >
            Nurse
          </button>
        </div>

        <div className="role-image-container">
          <img
            src={formData.role === 'student' ? studentIcon : nurseIcon}
            alt={formData.role === 'student' ? 'Student' : 'Nurse'}
            className="role-image"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <p className="register-prompt">
            Don't have an account? <Link to="/register" className="register-link">Register here</Link>
          </p>
          <p className="forgot-password">
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;