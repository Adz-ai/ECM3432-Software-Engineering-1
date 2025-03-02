// src/services/api.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding token to request:', config.url); // Debug log
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error); // Debug log
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response || error); // Debug log

    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
      console.log('401 Unauthorized - clearing auth data'); // Debug log
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (credentials) => {
    console.log('Login request with:', credentials.username); // Debug log
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data); // Debug log
      return response;
    } catch (error) {
      console.error('Login error in service:', error); // Debug log
      throw error;
    }
  },
  register: async (userData) => {
    console.log('Register request with:', userData.username); // Debug log
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data); // Debug log
      return response;
    } catch (error) {
      console.error('Register error in service:', error); // Debug log
      throw error;
    }
  },
  // For testing/debugging - simulate a login
  mockLogin: (credentials) => {
    console.log('MOCK LOGIN:', credentials); // Debug log
    const mockResponse = {
      data: {
        token: 'mock-jwt-token-for-testing',
        user: {
          username: credentials.username,
          is_staff: credentials.username.includes('staff'),
        },
      },
    };
    return Promise.resolve(mockResponse);
  },
};

// Issue services
export const issuesService = {
  getAllIssues: (page = 1, pageSize = 10) =>
    api.get(`/issues?page=${page}&pageSize=${pageSize}`),
  getIssueById: (id) => api.get(`/issues/${id}`),
  createIssue: (issueData) => api.post('/issues', issueData),
  updateIssue: (id, issueData) => api.put(`/issues/${id}`, issueData),
  searchIssues: (type, status) =>
    api.get(`/issues/search?type=${type || ''}&status=${status || ''}`),
  getMapIssues: () => api.get('/issues/map'),
};

// Analytics services
export const analyticsService = {
  getIssueAnalytics: (startDate, endDate) =>
    api.get(`/issues/analytics?startDate=${startDate || ''}&endDate=${endDate || ''}`),
};

export default api;
