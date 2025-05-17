import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AddEditMedicalRecord.css';
import api from '../api';

const AddEditMedicalRecord = () => {
  const { studentId, recordId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    record_type: 'Checkup',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: '',
    active: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, recordRes] = await Promise.all([
          api.get(`/students/${studentId}`),
          recordId ? api.get(`/medical-records/${recordId}`) : Promise.resolve(null)
        ]);
        
        setStudent(studentRes.data);
        if (recordRes?.data) {
          setFormData({
            ...recordRes.data,
            date: recordRes.data.date.split('T')[0]
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [studentId, recordId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        ...formData,
        student_id: studentId,
        date: new Date(formData.date).toISOString()
      };

      if (recordId) {
        await api.put(`/medical-records/${recordId}`, data);
      } else {
        await api.post('/medical-records', data);
      }
      navigate(`/nurse/medical-records/${studentId}`);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className="medical-record-form">
      <h2>
        {recordId ? 'Edit Medical Record' : 'Add Medical Record'} for {student.name}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Record Type</label>
          <select
            name="record_type"
            value={formData.record_type}
            onChange={handleChange}
            required
          >
            <option value="Checkup">Checkup</option>
            <option value="Emergency">Emergency</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Follow-up">Follow-up</option>
          </select>
          {errors.record_type && <span className="error">{errors.record_type[0]}</span>}
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          {errors.date && <span className="error">{errors.date[0]}</span>}
        </div>

        <div className="form-group">
          <label>Diagnosis</label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            rows="3"
          />
          {errors.diagnosis && <span className="error">{errors.diagnosis[0]}</span>}
        </div>

        <div className="form-group">
          <label>Treatment</label>
          <textarea
            name="treatment"
            value={formData.treatment}
            onChange={handleChange}
            rows="3"
          />
          {errors.treatment && <span className="error">{errors.treatment[0]}</span>}
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />
          {errors.notes && <span className="error">{errors.notes[0]}</span>}
        </div>

        {recordId && (
          <div className="form-group">
            <label>Status</label>
            <select
              name="active"
              value={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
            >
              <option value={true}>Active</option>
              <option value={false}>Archived</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Record'}
        </button>
        <button 
          type="button" 
          onClick={() => navigate(`/nurse/medical-records/${studentId}`)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddEditMedicalRecord;