// src/services/api.ts

import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { IssueType, IssueStatus } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL;

// Define interfaces for API data structures
export interface User {
  id?: number;
  username: string;
  is_staff: boolean;
  email?: string;
  userType?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email?: string;
  is_staff?: boolean;
  staff_secret?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Issue {
  id: number;
  type: IssueType;
  status: IssueStatus;
  description: string;
  location: Location;
  reported_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  images: string[];
}

export interface IssueData {
  type: IssueType;
  description: string;
  location: Location;
  images?: File[];
}

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  avgResolutionTime: string;
  issuesByType: { type: IssueType; count: number }[];
  issuesByStatus: { status: IssueStatus; count: number }[];
  issuesTimeline: { date: string; reported: number; resolved: number }[];
  staffPerformance: { staffName: string; assigned: number; resolved: number }[];
}

export interface Engineer {
  id: number;
  name: string;
  assigned_issues: number;
}

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
const addAuthToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers) {
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
const handleResponseError = (error: any): Promise<never> => {
  // Log less information in production
  if (import.meta.env.DEV) {
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
  login: async (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => {
    console.log('Login request with:', credentials.username);
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response;
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
  },
  register: async (userData: RegisterData): Promise<AxiosResponse<{ message: string }>> => {
    console.log('Register request with:', userData.username);
    try {
      const response = await api.post<{ message: string }>('/auth/register', userData);
      console.log('Register response:', response.data);
      return response;
    } catch (error) {
      console.error('Register error in service:', error);
      throw error;
    }
  },
  // For testing/debugging - simulate a login
  mockLogin: (credentials: LoginCredentials): Promise<{ data: AuthResponse }> => {
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
  getAllIssues: (page = 1, pageSize = 10): Promise<AxiosResponse<Issue[]>> =>
      api.get<Issue[]>(`/issues?page=${page}&pageSize=${pageSize}`),

  getIssueById: (id: number): Promise<AxiosResponse<Issue>> => {
    if (!id) {
      console.error('getIssueById called with invalid ID:', id);
      return Promise.reject(new Error('Invalid issue ID'));
    }
    return api.get<Issue>(`/issues/${id}`);
  },

  // JSON-based issue creation (legacy)
  createIssue: (issueData: IssueData): Promise<AxiosResponse<{ id: number }>> =>
      api.post<{ id: number }>('/issues', issueData),

  // Form-data based issue creation with image uploads
  createIssueWithImages: (formData: FormData): Promise<AxiosResponse<{ id: number }>> => {
    console.log('Creating issue with form data and images');
    // No need to set Content-Type - axios will auto-set it with boundary for form data
    return apiFormData.post<{ id: number }>('/issues', formData);
  },

  updateIssue: (id: number, issueData: Partial<IssueData>): Promise<AxiosResponse<{ message: string }>> =>
      api.put<{ message: string }>(`/issues/${id}`, issueData),

  searchIssues: (type?: string, status?: string): Promise<AxiosResponse<Issue[]>> =>
      api.get<Issue[]>(`/issues/search?type=${type || ''}&status=${status || ''}`),

  getMapIssues: (): Promise<AxiosResponse<Omit<Issue, 'description' | 'reported_by' | 'assigned_to' | 'created_at' | 'updated_at' | 'images'>[]>> =>
      api.get('/issues/map'),
};

// Analytics services
export const analyticsService = {
  getIssueAnalytics: (startDate?: string, endDate?: string): Promise<AxiosResponse<AnalyticsData>> =>
      api.get<AnalyticsData>(`/issues/analytics?startDate=${startDate || ''}&endDate=${endDate || ''}`),

  getEngineerPerformance: (): Promise<AxiosResponse<{ staffName: string; assigned: number; resolved: number }[]>> =>
      api.get('/analytics/engineers'),

  getResolutionTime: (): Promise<AxiosResponse<any>> =>
      api.get('/analytics/resolution-time'),
};

// Engineers services
export const engineersService = {
  getAllEngineers: (): Promise<AxiosResponse<Engineer[]>> => api.get<Engineer[]>('/engineers'),
  getEngineerById: (id: number): Promise<AxiosResponse<Engineer>> => api.get<Engineer>(`/engineers/${id}`),
};

export default api;