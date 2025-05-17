import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // Replace with your actual API URL in production

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // For web applications, redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 