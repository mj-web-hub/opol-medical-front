import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const NurseMedicalRecords = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterByStudent, setFilterByStudent] = useState(studentId || 'all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all medical records
        const recordsResponse = await api.get('/medical-records');
        
        // Fetch all students for the dropdown filter
        const studentsResponse = await api.get('/students');
        
        // If a specific student is selected, also fetch that student's details
        let selectedStudent = null;
        if (studentId) {
          const studentResponse = await api.get(`/students/${studentId}`);
          selectedStudent = studentResponse.data;
        }
        
        setRecords(recordsResponse.data.data || recordsResponse.data);
        setStudents(studentsResponse.data.data || studentsResponse.data);
        
        // If there's a specific student, add their details
        if (selectedStudent) {
          const studentExists = (studentsResponse.data.data || studentsResponse.data)
            .some(s => s.id === selectedStudent.id);
          
          if (!studentExists) {
            setStudents(prev => [...prev, selectedStudent]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [studentId]);

  const handleAddNewRecord = () => {
    if (filterByStudent !== 'all') {
      navigate(`/nurse/medical-records/${filterByStudent}/add`);
    } else {
      // If no student is selected, first prompt to select a student
      alert('Please select a student first to add a new medical record.');
    }
  };

  const handleViewRecord = (recordId) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      navigate(`/nurse/medical-records/${record.user_id}/view/${recordId}`);
    }
  };

  const handleEditRecord = (recordId) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      navigate(`/nurse/medical-records/${record.user_id}/edit/${recordId}`);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (confirmDelete === recordId) {
      try {
        await api.delete(`/medical-records/${recordId}`);
        setRecords(records.filter(record => record.id !== recordId));
        setConfirmDelete(null);
      } catch (err) {
        alert('Failed to delete record: ' + (err.response?.data?.message || err.message));
      }
    } else {
      setConfirmDelete(recordId);
    }
  };

  const handleToggleStatus = async (record) => {
    try {
      const updatedRecord = { ...record, active: !record.active };
      await api.put(`/medical-records/${record.id}`, updatedRecord);
      
      setRecords(records.map(r => 
        r.id === record.id ? { ...r, active: !r.active } : r
      ));
    } catch (err) {
      alert('Failed to update record status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStudentFilterChange = (e) => {
    setFilterByStudent(e.target.value);
    // Update URL if specific student is selected
    if (e.target.value !== 'all') {
      navigate(`/nurse/medical-records/${e.target.value}`);
    } else {
      navigate(`/nurse/medical-records`);
    }
  };

  // Get filtered records based on student and active status
  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesStudent = filterByStudent === 'all' || record.user_id.toString() === filterByStudent.toString();
      const matchesStatus = activeTab === 'current' ? (record.active !== false) : (record.active === false);
      return matchesStudent && matchesStatus;
    });
  };

  // Find student name from student ID
  const getStudentName = (userId) => {
    const student = students.find(s => s.id.toString() === userId.toString());
    return student ? student.name : 'Unknown Student';
  };

  // Get student ID number from user ID
  const getStudentIdNumber = (userId) => {
    const student = students.find(s => s.id.toString() === userId.toString());
    return student ? student.student_id : 'N/A';
  };

  const filteredRecords = getFilteredRecords();

  if (loading) return <div className="loading">Loading medical records...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="nurse-medical-records">
      <div className="header">
        <h2>
          {filterByStudent !== 'all' 
            ? `Medical Records for: ${getStudentName(filterByStudent)} (${getStudentIdNumber(filterByStudent)})`
            : 'All Students Medical Records'}
        </h2>
        <div className="actions">
          <select 
            value={filterByStudent} 
            onChange={handleStudentFilterChange}
            className="student-filter"
          >
            <option value="all">All Students</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.student_id})
              </option>
            ))}
          </select>
          <button className="add-button" onClick={handleAddNewRecord}>
            Add New Record
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'current' ? 'active' : ''}
          onClick={() => setActiveTab('current')}
        >
          Current Records
        </button>
        <button
          className={activeTab === 'archived' ? 'active' : ''}
          onClick={() => setActiveTab('archived')}
        >
          Archived Records
        </button>
      </div>

      {filteredRecords.length === 0 ? (
        <p className="no-records">No {activeTab === 'current' ? 'current' : 'archived'} records found</p>
      ) : (
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>ID Number</th>
                <th>Chronic Conditions</th>
                <th>Allergies</th>
                <th>Previous Illnesses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>{getStudentName(record.user_id)}</td>
                  <td>{getStudentIdNumber(record.user_id)}</td>
                  <td>{record.chronic_conditions || 'None'}</td>
                  <td>{record.allergies || 'None'}</td>
                  <td>{record.previous_illnesses || 'None'}</td>
                  <td>
                    <span className={`status-badge ${record.active !== false ? 'active' : 'inactive'}`}>
                      {record.active !== false ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button className="view-btn" onClick={() => handleViewRecord(record.id)}>
                      View
                    </button>
                    <button className="edit-btn" onClick={() => handleEditRecord(record.id)}>
                      Edit
                    </button>
                    <button 
                      className={`status-btn ${record.active !== false ? 'archive-btn' : 'restore-btn'}`}
                      onClick={() => handleToggleStatus(record)}
                    >
                      {record.active !== false ? 'Archive' : 'Restore'}
                    </button>
                    <button 
                      className={`delete-btn ${confirmDelete === record.id ? 'confirm' : ''}`}
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      {confirmDelete === record.id ? 'Confirm Delete' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NurseMedicalRecords;