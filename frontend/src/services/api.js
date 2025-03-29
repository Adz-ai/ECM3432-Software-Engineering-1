// src/services/api.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Create an instance for JSON requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate instance for multipart/form-data requests (file uploads)
const apiFormData = axios.create({
  baseURL: API_URL,
});

// Helper function to add auth token to requests
const addAuthToken = (config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    // Avoid logging sensitive token data, even in dev
    // console.log('Adding token to request:', config.url);
  }
  return config;
};

// Request interceptor for adding auth token to JSON requests
api.interceptors.request.use(
    addAuthToken,
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
);

// Request interceptor for adding auth token to form data requests
apiFormData.interceptors.request.use(
    addAuthToken,
    (error) => {
      console.error('FormData request interceptor error:', error);
      return Promise.reject(error);
    }
);

// Response interceptor for handling errors (shared logic)
const handleResponseError = (error) => {
  // Log less information in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error.response || error);
  } else {
    console.error(`API Error on ${error.config?.url}: ${error.message}`);
  }

  if (error.response && error.response.status === 401) {
    // Handle unauthorized error (e.g., redirect to login)
    console.log('401 Unauthorized - clearing auth data');
    sessionStorage.removeItem('token'); // Use sessionStorage
    // localStorage.removeItem('user'); // No longer storing user object separately
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

// Add response interceptors to both instances
api.interceptors.response.use(response => response, handleResponseError);
apiFormData.interceptors.response.use(response => response, handleResponseError);

// Auth services
export const authService = {
  login: async (credentials) => {
    console.log('Login request with:', credentials.username);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response;
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
  },
  register: async (userData) => {
    console.log('Register request with:', userData.username);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data);
      return response;
    } catch (error) {
      console.error('Register error in service:', error);
      throw error;
    }
  },
  // For testing/debugging - simulate a login
  mockLogin: (credentials) => {
    console.log('MOCK LOGIN:', credentials);
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

  getIssueById: (id) => {
    if (!id) {
      console.error('getIssueById called with invalid ID:', id);
      return Promise.reject(new Error('Invalid issue ID'));
    }
    return api.get(`/issues/${id}`);
  },

  // JSON-based issue creation (legacy)
  createIssue: (issueData) => api.post('/issues', issueData),

  // Form-data based issue creation with image uploads
  createIssueWithImages: (formData) => {
    console.log('Creating issue with form data and images');
    // No need to set Content-Type - axios will auto-set it with boundary for form data
    return apiFormData.post('/issues', formData);
  },

  updateIssue: (id, issueData) => api.put(`/issues/${id}`, issueData),

  searchIssues: (type, status) =>
      api.get(`/issues/search?type=${type || ''}&status=${status || ''}`),

  getMapIssues: () => api.get('/issues/map'),
};

// Analytics services
export const analyticsService = {
  getIssueAnalytics: (startDate, endDate) =>
      api.get(`/issues/analytics?startDate=${startDate || ''}&endDate=${endDate || ''}`),
  
  getEngineerPerformance: () =>
      api.get('/analytics/engineers'),
      
  getResolutionTime: () =>
      api.get('/analytics/resolution-time'),
};

// Engineers services
export const engineersService = {
  getAllEngineers: () => api.get('/engineers'),
  getEngineerById: (id) => api.get(`/engineers/${id}`),
};

export default api;