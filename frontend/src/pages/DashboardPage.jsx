// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { analyticsService, issuesService } from '../services/api';
import IssueTypeChart from '../components/dashboard/IssueTypeChart';
import IssueStatusChart from '../components/dashboard/IssueStatusChart';
import TimelineChart from '../components/dashboard/TimelineChart';
import StaffPerformance from '../components/dashboard/StaffPerformance';

const DashboardPage = () => {
  const { currentUser, isStaff } = useContext(AuthContext);
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // IMPORTANT: Hooks must be called at the top level, not conditionally
  useEffect(() => {
    // Only fetch data if user is logged in and is staff
    if (currentUser && isStaff()) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);

          // Get default date range (last 30 days)
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];

          setDateRange({ startDate, endDate });

          // Fetch analytics data
          const analyticsResponse = await analyticsService.getIssueAnalytics(
            startDate,
            endDate
          );

          // Fetch recent issues
          const issuesResponse = await issuesService.getAllIssues(1, 10);

          setAnalytics(analyticsResponse.data);
          setIssues(issuesResponse.data);
        } catch (err) {
          setError('Failed to load dashboard data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [currentUser, isStaff]);

  const handleDateRangeChange = async (e) => {
    const { name, value } = e.target;
    const newDateRange = { ...dateRange, [name]: value };
    setDateRange(newDateRange);

    // Only fetch new data if both dates are set
    if (newDateRange.startDate && newDateRange.endDate) {
      try {
        setLoading(true);
        const response = await analyticsService.getIssueAnalytics(
          newDateRange.startDate,
          newDateRange.endDate
        );
        setAnalytics(response.data);
      } catch (err) {
        setError('Failed to update analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // If not logged in or not staff, redirect to appropriate page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!isStaff()) {
    return <Navigate to="/" />;
  }

  if (loading && !analytics) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Staff Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="date-range-selector">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateRangeChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Issues</h3>
          <p className="summary-value">{analytics?.totalIssues || 0}</p>
        </div>

        <div className="summary-card">
          <h3>Resolved Issues</h3>
          <p className="summary-value">{analytics?.resolvedIssues || 0}</p>
        </div>

        <div className="summary-card">
          <h3>Pending Issues</h3>
          <p className="summary-value">{analytics?.pendingIssues || 0}</p>
        </div>

        <div className="summary-card">
          <h3>Avg. Resolution Time</h3>
          <p className="summary-value">{analytics?.avgResolutionTime || 'N/A'}</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h2>Issues by Type</h2>
          <IssueTypeChart data={analytics?.issuesByType || []} />
        </div>

        <div className="chart-container">
          <h2>Issues by Status</h2>
          <IssueStatusChart data={analytics?.issuesByStatus || []} />
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container full-width">
          <h2>Issues Timeline</h2>
          <TimelineChart data={analytics?.issuesTimeline || []} />
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Staff Performance</h2>
        <StaffPerformance data={analytics?.staffPerformance || []} />
      </div>

      <div className="dashboard-section">
        <h2>Recent Issues</h2>
        <table className="issues-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Assigned To</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id}>
                <td>{issue.id}</td>
                <td>{issue.type.replace('_', ' ')}</td>
                <td>{issue.status}</td>
                <td>{issue.reported_by}</td>
                <td>{issue.assigned_to || 'Unassigned'}</td>
                <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
