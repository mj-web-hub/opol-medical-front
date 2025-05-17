import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const RegisterNurse = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    license_number: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post('/nurses/register', formData);
      setSuccess(true);
      setTimeout(() => navigate('/nurse-dashboard'), 2000);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: err.response?.data?.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-nurse">
      <h2>Register New Nurse</h2>
      
      {success ? (
        <div className="success-message">
          Nurse registered successfully! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {errors.general && <div className="error">{errors.general}</div>}
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="error">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email[0]}</span>}
          </div>

          <div className="form-group">
            <label>License Number</label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleChange}
              required
            />
            {errors.license_number && <span className="error">{errors.license_number[0]}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="error">{errors.password[0]}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Nurse'}
          </button>
        </form>
      )}
    </div>
  );
};

export default RegisterNurse;