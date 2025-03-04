// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { analyticsService, issuesService } from '../services/api';
import IssueTypeChart from '../components/dashboard/IssueTypeChart';
import IssueStatusChart from '../components/dashboard/IssueStatusChart';
import TimelineChart from '../components/dashboard/TimelineChart';
import StaffPerformance from '../components/dashboard/StaffPerformance';

// Helper function to convert API response to the format expected by chart components
const transformAnalyticsData = (apiResponse) => {
  console.log('Transforming API response:', apiResponse);

  // Handle empty or null responses
  if (!apiResponse) {
    return {
      totalIssues: 0,
      resolvedIssues: 0,
      pendingIssues: 0,
      avgResolutionTime: 'N/A',
      issuesByType: [],
      issuesByStatus: [],
      issuesTimeline: [],
      staffPerformance: []
    };
  }

  // Transform issues_by_type from {TYPE: count} to [{type: TYPE, count: count}]
  const issuesByType = Object.entries(apiResponse.issues_by_type || {}).map(([type, count]) => ({
    type,
    count
  }));

  // Transform issues_by_status from {STATUS: count} to [{status: STATUS, count: count}]
  const issuesByStatus = Object.entries(apiResponse.issues_by_status || {}).map(([status, count]) => ({
    status,
    count
  }));

  // Transform issues_by_month from {MONTH: count} to [{date: MONTH, reported: count, resolved: 0}]
  const issuesTimeline = Object.entries(apiResponse.issues_by_month || {}).map(([date, count]) => ({
    date,
    reported: count,
    resolved: 0 // No resolved data available in API response
  }));

  // Transform engineer_performance (if it exists)
  const staffPerformance = Object.entries(apiResponse.engineer_performance || {}).map(([staffName, data]) => ({
    staffName,
    assigned: data.assigned || 0,
    resolved: data.resolved || 0
  }));

  // Calculate resolved and pending issues
  const totalIssues = apiResponse.total_issues || 0;
  const resolvedCount =
    (apiResponse.issues_by_status && apiResponse.issues_by_status.RESOLVED) || 0 +
    (apiResponse.issues_by_status && apiResponse.issues_by_status.CLOSED) || 0;

  return {
    totalIssues: totalIssues,
    resolvedIssues: resolvedCount,
    pendingIssues: totalIssues - resolvedCount,
    avgResolutionTime: apiResponse.average_resolution_time || 'N/A',
    issuesByType,
    issuesByStatus,
    issuesTimeline,
    staffPerformance
  };
};

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

  useEffect(() => {
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
          try {
            const analyticsResponse = await analyticsService.getIssueAnalytics(
              startDate,
              endDate
            );
            console.log('Analytics API response:', analyticsResponse.data);

            // Transform the API response to the format expected by the dashboard
            const transformedData = transformAnalyticsData(analyticsResponse.data);
            console.log('Transformed analytics data:', transformedData);

            setAnalytics(transformedData);
          } catch (analyticsError) {
            console.error('Error fetching analytics:', analyticsError);
            setAnalytics(transformAnalyticsData(null));
          }

          // Fetch recent issues
          try {
            const issuesResponse = await issuesService.getAllIssues(1, 10);
            console.log('Issues API response:', issuesResponse.data);

            // Ensure we have an array of issues
            if (Array.isArray(issuesResponse.data)) {
              setIssues(issuesResponse.data);
            } else if (issuesResponse.data && Array.isArray(issuesResponse.data.data)) {
              setIssues(issuesResponse.data.data);
            } else {
              console.warn('Unexpected issues response format:', issuesResponse.data);
              setIssues([]);
            }
          } catch (issuesError) {
            console.error('Error fetching issues:', issuesError);
            setIssues([]);
          }
        } catch (err) {
          console.error('Dashboard error:', err);
          setError('Failed to load dashboard data');
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

        // Transform the API response
        const transformedData = transformAnalyticsData(response.data);
        setAnalytics(transformedData);
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
          <p className="summary-value">{typeof analytics?.avgResolutionTime === 'string' ?
            analytics.avgResolutionTime : 'N/A'}</p>
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
        {analytics?.staffPerformance && analytics.staffPerformance.length > 0 ? (
          <StaffPerformance data={analytics.staffPerformance} />
        ) : (
          <div className="no-data-message">No staff performance data available</div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Issues</h2>

        {!Array.isArray(issues) || issues.length === 0 ? (
          <div className="no-data-message">No issues found</div>
        ) : (
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
              <tr key={issue.id || `issue-${Math.random()}`}>
                <td>{issue.id || 'N/A'}</td>
                <td>{(issue.type && typeof issue.type === 'string' ?
                  issue.type.replace(/_/g, ' ') : 'N/A')}</td>
                <td>{issue.status || 'N/A'}</td>
                <td>{issue.reported_by || 'N/A'}</td>
                <td>{issue.assigned_to || 'Unassigned'}</td>
                <td>{issue.created_at ?
                  new Date(issue.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    disabled={!issue.id}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .no-data-message {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 2rem;
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
