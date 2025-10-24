// src/hooks/useIssues.ts

import { useState, useEffect, useCallback } from 'react';
import { issuesService, Issue } from '../services/api';
import { IssueType, IssueStatus } from '../utils/constants';

interface CreateIssueData {
  type: IssueType;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  images?: File[];
}

interface UpdateIssueData {
  type?: IssueType;
  status?: IssueStatus;
  description?: string;
  assigned_to?: string;
  resolution_notes?: string;
}

/**
 * Custom hook for managing issues data and operations
 */
const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalIssues, setTotalIssues] = useState<number>(0);

  // Fetch issues with pagination
  const fetchIssues = useCallback(async (pageNum: number = page, pageSizeNum: number = pageSize): Promise<void> => {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch issues';
      setError(errorMessage);
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // Fetch a single issue by ID
  const fetchIssueById = useCallback(async (id: number): Promise<Issue | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.getIssueById(id);
      setCurrentIssue(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch issue #${id}`;
      setError(errorMessage);
      console.error(`Error fetching issue #${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new issue
  const createIssue = useCallback(async (issueData: CreateIssueData): Promise<{ id: number }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.createIssue(issueData);
      // Refresh the issues list
      fetchIssues();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create issue';
      setError(errorMessage);
      console.error('Error creating issue:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIssues]);

  // Update an existing issue
  const updateIssue = useCallback(async (id: number, issueData: UpdateIssueData): Promise<{ message: string }> => {
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
        } as Issue);
      }

      // Refresh the issues list
      fetchIssues();

      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update issue #${id}`;
      setError(errorMessage);
      console.error(`Error updating issue #${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentIssue, fetchIssues]);

  // Search issues by type and/or status
  const searchIssues = useCallback(async (type?: IssueType, status?: IssueStatus): Promise<Issue[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.searchIssues(type, status);
      setIssues(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search issues';
      setError(errorMessage);
      console.error('Error searching issues:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch issues for map view
  const fetchMapIssues = useCallback(async (): Promise<Issue[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = await issuesService.getMapIssues();
      return response.data as Issue[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch map issues';
      setError(errorMessage);
      console.error('Error fetching map issues:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Pagination handler
  const handlePageChange = useCallback((newPage: number): void => {
    setPage(newPage);
    fetchIssues(newPage, pageSize);
  }, [fetchIssues, pageSize]);

  // Page size handler
  const handlePageSizeChange = useCallback((newPageSize: number): void => {
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
