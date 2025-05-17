import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students'); // Updated API endpoint
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const results = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this student?')) {
      try {
        await api.patch(`/api/students/${id}`, { active: false }); // Updated API endpoint
        setStudents(students.map(student =>
          student.id === id ? { ...student, active: false } : student
        ));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to deactivate student');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/nurse/students/edit/${id}`);
  };

  const handleViewMedicalRecords = (studentId) => {
    navigate(`/nurse/medical-records/${studentId}`);
  };

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="students-management">
      <div className="header">
        <h2>Manage Students</h2>
        <div className="actions">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="add-button"
            onClick={() => navigate('/nurse/students/add')}
          >
            Add New Student
          </button>
        </div>
      </div>

      <table className="students-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Year Level</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(student => (
            <tr key={student.id}>
              <td>{student.student_id}</td>
              <td>{student.name}</td>
              <td>{student.course}</td>
              <td>{student.year_level}</td>
              <td className={student.active ? 'active' : 'inactive'}>
                {student.active ? 'Active' : 'Inactive'}
              </td>
              <td className="actions">
                <button onClick={() => handleViewMedicalRecords(student.id)}>
                  View Records
                </button>
                <button onClick={() => handleEdit(student.id)}>Edit</button>
                {student.active && (
                  <button
                    className="delete"
                    onClick={() => handleDelete(student.id)}
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsManagement;