import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch CSRF token
  const getCsrfToken = async () => {
    try {
      await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      console.log('CSRF token fetched successfully');
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      // Continue anyway - some endpoints might work without CSRF token
    }
  };

  useEffect(() => {
    // Configure axios defaults
    axios.defaults.baseURL = 'http://localhost:8000/api';
    axios.defaults.withCredentials = true; // Enable sending cookies with requests

    // Restore session from localStorage if available
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Get CSRF token for cookie-based authentication on initial load
    getCsrfToken();
  }, []);

  const registerStudent = async (studentData) => {
    setIsLoading(true);
    setError(null);
    try {
      // First get CSRF token
      await getCsrfToken();

      console.log('Attempting registration at:', 'http://localhost:8000/api/register');

      const response = await axios.post('/register', studentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // Handle successful registration
      if (response.data.user) {
        // Store token and user info
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }

      return response.data;
    } catch (error) {
      console.error('Registration error details:', error.response || error);
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.error ||
                           'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced login function with improved error logging and debugging
 const login = async (email, password) => {
  setIsLoading(true);
  setError(null);
  try {
    // Ensure email is lowercase
    const lowercaseEmail = email.toLowerCase().trim();

    // First get CSRF token
    await getCsrfToken();

    const response = await axios.post('/login', {
      email: lowercaseEmail,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Handle successful login
    if (response.data.access_token) {
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      return userData;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed';
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    }
    setError(errorMessage);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      registerStudent,
      isLoading,
      error,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};