import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './RegisterScreen.css';

const debugFormData = (formData) => {
  console.log("==== FormData Contents ====");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log("==========================");
};

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    student_id: '',
    course: '',
    year_level: '',
    date_of_birth: '',
    gender: '',
    address: '',
    contact_number: '',
    marital_status: '',
    occupation: '',
    nationality: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_number: '',
    emergency_contact_email: ''
  });

  const [errors, setErrors] = useState({});
  const { registerStudent, isLoading, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const courseOptions = [
    { value: 'BSIT', label: 'BSIT - Information Technology' },
    { value: 'BSBA-FM', label: 'BSBA-FM - Financial Management' },
    { value: 'BSBA-MM', label: 'BSBA-MM - Marketing Management' },
    { value: 'BSED', label: 'BSED - Secondary Education' },
    { value: 'BEED', label: 'BEED - Elementary Education' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    }
    if (!formData.student_id) newErrors.student_id = 'Student ID is required';
    if (!formData.course) newErrors.course = 'Course is required';
    if (!formData.year_level) newErrors.year_level = 'Year level is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.contact_number) newErrors.contact_number = 'Contact number is required';
    if (!formData.emergency_contact_name) {
      newErrors.emergency_contact_name = 'Emergency contact name is required';
    }
    if (!formData.emergency_contact_relationship) {
      newErrors.emergency_contact_relationship = 'Relationship is required';
    }
    if (!formData.emergency_contact_number) {
      newErrors.emergency_contact_number = 'Emergency contact number is required';
    }

    // Format validations
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (formData.student_id && !/^\d{4}-\d-\d{5}$/.test(formData.student_id)) {
      newErrors.student_id = 'Format: YYYY-D-DDDDD (e.g., 2020-1-12345)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Client-side validation
    if (!validate()) return;

    try {
      const formDataToSend = new FormData();

      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          // Handle date formatting if needed
          if (key === 'date_of_birth' && formData[key]) {
            formDataToSend.append(key, new Date(formData[key]).toISOString().split('T')[0]);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Debug: Log what we're sending
      debugFormData(formDataToSend);

      await registerStudent(formDataToSend);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);

      if (error.validationErrors) {
        // Transform Laravel errors to match our form
        const formattedErrors = {};
        Object.entries(error.validationErrors).forEach(([field, messages]) => {
          formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(formattedErrors);
      } else {
        setErrors({
          general: error.message || 'Registration failed. Please try again.'
        });
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-inner-container">
        <h1 className="title">Student Registration</h1>
        {errors.general && <div className="error-message">{errors.general}</div>}
        {authError && <div className="error-message">{authError}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={errors.date_of_birth ? 'input-error' : ''}
              />
              {errors.date_of_birth && <span className="error">{errors.date_of_birth}</span>}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? 'input-error' : ''}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <span className="error">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'input-error' : ''}
                rows="3"
              />
              {errors.address && <span className="error">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className={errors.contact_number ? 'input-error' : ''}
              />
              {errors.contact_number && <span className="error">{errors.contact_number}</span>}
            </div>

            <div className="form-group">
              <label>Marital Status</label>
              <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
              >
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Occupation</label>
              <input
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Nationality</label>
              <input
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Student Information */}
          <div className="form-section">
            <h3>Student Information</h3>
            <div className="form-group">
              <label>Student ID</label>
              <input
                name="student_id"
                placeholder="YYYY-D-DDDDD"
                value={formData.student_id}
                onChange={handleChange}
                className={errors.student_id ? 'input-error' : ''}
              />
              {errors.student_id && <span className="error">{errors.student_id}</span>}
            </div>

            <div className="form-group">
              <label>Course</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className={errors.course ? 'input-error' : ''}
              >
                <option value="">Select Course</option>
                {courseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.course && <span className="error">{errors.course}</span>}
            </div>

            <div className="form-group">
              <label>Year Level</label>
              <select
                name="year_level"
                value={formData.year_level}
                onChange={handleChange}
                className={errors.year_level ? 'input-error' : ''}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {errors.year_level && <span className="error">{errors.year_level}</span>}
            </div>
          </div>

          {/* Emergency Contact Information */}
          <div className="form-section">
            <h3>Emergency Contact</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                className={errors.emergency_contact_name ? 'input-error' : ''}
              />
              {errors.emergency_contact_name && <span className="error">{errors.emergency_contact_name}</span>}
            </div>

            <div className="form-group">
              <label>Relationship</label>
              <input
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleChange}
                className={errors.emergency_contact_relationship ? 'input-error' : ''}
              />
              {errors.emergency_contact_relationship && <span className="error">{errors.emergency_contact_relationship}</span>}
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={handleChange}
                className={errors.emergency_contact_number ? 'input-error' : ''}
              />
              {errors.emergency_contact_number && <span className="error">{errors.emergency_contact_number}</span>}
            </div>

            <div className="form-group">
              <label>Email (Optional)</label>
              <input
                type="email"
                name="emergency_contact_email"
                value={formData.emergency_contact_email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="form-section">
            <h3>Account Security</h3>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className={errors.password_confirmation ? 'input-error' : ''}
              />
              {errors.password_confirmation && <span className="error">{errors.password_confirmation}</span>}
            </div>
          </div>

          <button
            type="submit"
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="auth-links">
          <p className="login-prompt">
            Already have an account?{' '}
            <a href="/login" className="login-link">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;