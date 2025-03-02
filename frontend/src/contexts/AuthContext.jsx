// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored user data on initial load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('Found stored user:', userData); // Debug log
        setCurrentUser(userData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting login for:', username); // Debug log
      const response = await authService.login({ username, password });

      // Mock response for testing if your API isn't working yet
      // const response = {
      //   data: {
      //     token: "mock-token-123",
      //     user: { username, is_staff: username.includes('staff') }
      //   }
      // };

      console.log('Login response:', response.data); // Debug log

      const { token, user } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error('Login error:', err); // Debug log
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
      console.log('Registration successful:', response.data); // Debug log
      return response.data;
    } catch (err) {
      console.error('Registration error:', err); // Debug log
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user:', currentUser?.username); // Debug log
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
