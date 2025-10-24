// src/hooks/useAnalytics.ts

import { useState, useCallback } from 'react';
import { analyticsService, AnalyticsData } from '../services/api';

interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Custom hook for analytics data and operations
 */
const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
  });

  // Fetch analytics data for a date range
  const fetchAnalytics = useCallback(async (startDate: string | null = null, endDate: string | null = null): Promise<AnalyticsData | null> => {
    const start = startDate || dateRange.startDate;
    const end = endDate || dateRange.endDate;

    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getIssueAnalytics(start, end);
      setAnalyticsData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Update date range and optionally fetch new data
  const updateDateRange = useCallback((newRange: DateRange, fetchData: boolean = true): void => {
    setDateRange(newRange);

    if (fetchData && newRange.startDate && newRange.endDate) {
      fetchAnalytics(newRange.startDate, newRange.endDate);
    }
  }, [fetchAnalytics]);

  // Set default date range (e.g., last 30 days)
  const setDefaultDateRange = useCallback((): DateRange => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newRange: DateRange = { startDate, endDate };
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
