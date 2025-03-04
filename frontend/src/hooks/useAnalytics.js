// src/hooks/useAnalytics.js

import { useState, useCallback } from 'react';
import { analyticsService } from '../services/api';

/**
 * Custom hook for analytics data and operations
 */
const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Fetch analytics data for a date range
  const fetchAnalytics = useCallback(async (startDate = null, endDate = null) => {
    const start = startDate || dateRange.startDate;
    const end = endDate || dateRange.endDate;

    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getIssueAnalytics(start, end);
      setAnalyticsData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Update date range and optionally fetch new data
  const updateDateRange = useCallback((newRange, fetchData = true) => {
    setDateRange(newRange);

    if (fetchData && newRange.startDate && newRange.endDate) {
      fetchAnalytics(newRange.startDate, newRange.endDate);
    }
  }, [fetchAnalytics]);

  // Set default date range (e.g., last 30 days)
  const setDefaultDateRange = useCallback(() => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newRange = { startDate, endDate };
    setDateRange(newRange);

    return newRange;
  }, []);

  return {
    analyticsData,
    loading,
    error,
    dateRange,
    fetchAnalytics,
    updateDateRange,
    setDefaultDateRange,
  };
};

export default useAnalytics;
