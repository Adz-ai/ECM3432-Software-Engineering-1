// src/hooks/useIssues.js

import { useState, useEffect, useCallback } from 'react';
import { issuesService } from '../services/api';

/**
 * Custom hook for managing issues data and operations
 */
const useIssues = () => {
  const [issues, setIssues] = useState([]);
  const [currentIssue, setCurrentIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalIssues, setTotalIssues] = useState(0);

  // Fetch issues with pagination
  const fetchIssues = useCallback(async (pageNum = page, pageSizeNum = pageSize) => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.getAllIssues(pageNum, pageSizeNum);
      setIssues(response.data);
      // If API returns metadata about total count, update it
      if (response.headers && response.headers['x-total-count']) {
        setTotalIssues(parseInt(response.headers['x-total-count'], 10));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Fetch a single issue by ID
  const fetchIssueById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.getIssueById(id);
      setCurrentIssue(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || `Failed to fetch issue #${id}`);
      console.error(`Error fetching issue #${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new issue
  const createIssue = useCallback(async (issueData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.createIssue(issueData);
      // Refresh the issues list
      fetchIssues();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create issue');
      console.error('Error creating issue:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIssues]);

  // Update an existing issue
  const updateIssue = useCallback(async (id, issueData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.updateIssue(id, issueData);

      // Update currentIssue if it's the one being updated
      if (currentIssue && currentIssue.id === id) {
        setCurrentIssue({
          ...currentIssue,
          ...issueData,
          updated_at: new Date().toISOString(),
        });
      }

      // Refresh the issues list
      fetchIssues();

      return response.data;
    } catch (err) {
      setError(err.message || `Failed to update issue #${id}`);
      console.error(`Error updating issue #${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentIssue, fetchIssues]);

  // Search issues by type and/or status
  const searchIssues = useCallback(async (type, status) => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.searchIssues(type, status);
      setIssues(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to search issues');
      console.error('Error searching issues:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch issues for map view
  const fetchMapIssues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.getMapIssues();
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to fetch map issues');
      console.error('Error fetching map issues:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Pagination handler
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    fetchIssues(newPage, pageSize);
  }, [fetchIssues, pageSize]);

  // Page size handler
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
    fetchIssues(1, newPageSize);
  }, [fetchIssues]);

  // Load issues on initial render
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return {
    issues,
    currentIssue,
    loading,
    error,
    page,
    pageSize,
    totalIssues,
    fetchIssues,
    fetchIssueById,
    createIssue,
    updateIssue,
    searchIssues,
    fetchMapIssues,
    handlePageChange,
    handlePageSizeChange,
    setCurrentIssue,
  };
};

export default useIssues;
