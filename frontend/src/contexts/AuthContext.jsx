// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

// Helper function to decode JWT tokens
const parseJwt = (token) => {
  try {
    // Split the token and get the payload part (second part)
    const base64Url = token.split('.')[1];
    // Replace characters that are not valid for base64 URL encoding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Decode the base64 string and parse as JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored token on initial load
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Extract user information from JWT token
        const decodedToken = parseJwt(token);
        console.log('Decoded token:', decodedToken);

        if (decodedToken) {
          // Create a user object based on the token payload
          // Adjust these fields based on what your token contains
          const userData = {
            id: decodedToken.user_id,
            username: decodedToken.username || decodedToken.user_id || 'User',
            // Check if user_type is 'staff' to set is_staff to true
            is_staff: decodedToken.user_type === 'staff'
          };

          console.log('Constructed user data from token:', userData);
          setCurrentUser(userData);
        }
      } catch (e) {
        console.error('Error processing token:', e);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login for:', username);
      const response = await authService.login({ username, password });

      console.log('Login response:', response.data);

      const { token } = response.data;

      // Store token
      localStorage.setItem('token', token);

      // Extract user information from token
      const decodedToken = parseJwt(token);
      console.log('Decoded token after login:', decodedToken);

      if (decodedToken) {
        // Create a user object based on the token payload
        const userData = {
          id: decodedToken.user_id,
          username: decodedToken.username || decodedToken.user_id || username,
          // Check if user_type is 'staff' to set is_staff to true
          is_staff: decodedToken.user_type === 'staff'
        };

        console.log('Setting current user from token:', userData);
        setCurrentUser(userData);
        return userData;
      } else {
        throw new Error('Invalid token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user:', currentUser?.username);
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const isStaff = () => {
    return currentUser?.is_staff === true;
  };

  const value = {
    currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    isStaff,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
