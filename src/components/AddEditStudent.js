import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const AddEditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    email: '',
    course: '',
    year_level: '',
    active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const response = await api.get(`/students/${id}`);
          setFormData(response.data);
        } catch (err) {
          console.error('Error fetching student:', err);
        }
      };
      fetchStudent();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (id) {
        await api.put(`/students/${id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      navigate('/nurse/students');
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-form">
      <h2>{id ? 'Edit Student' : 'Add New Student'}</h2>
      
      <form onSubmit={handleSubmit}>
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
          <label>Student ID</label>
          <input
            type="text"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
            disabled={!!id}
          />
          {errors.student_id && <span className="error">{errors.student_id[0]}</span>}
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
          <label>Course</label>
          <input
            type="text"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
          />
          {errors.course && <span className="error">{errors.course[0]}</span>}
        </div>

        <div className="form-group">
          <label>Year Level</label>
          <select
            name="year_level"
            value={formData.year_level}
            onChange={handleChange}
            required
          >
            <option value="">Select Year Level</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          {errors.year_level && <span className="error">{errors.year_level[0]}</span>}
        </div>

        {id && (
          <div className="form-group">
            <label>Status</label>
            <select
              name="active"
              value={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Student'}
        </button>
        <button type="button" onClick={() => navigate('/nurse/students')}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddEditStudent;