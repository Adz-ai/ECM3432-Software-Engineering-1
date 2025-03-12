// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { analyticsService, issuesService } from '../services/api';
import IssueTypeChart from '../components/dashboard/IssueTypeChart';
import IssueStatusChart from '../components/dashboard/IssueStatusChart';
import TimelineChart from '../components/dashboard/TimelineChart';
import StaffPerformance from '../components/dashboard/StaffPerformance';
import ResolutionTimeChart from '../components/dashboard/ResolutionTimeChart';
import { motion } from 'framer-motion';

// Material UI imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
} from '@mui/material';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Create motion components
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionContainer = motion(Container);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionGrid = motion(Grid);

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

  // Transform issues_by_month from {MONTH: {reported: X, resolved: Y}} to [{date: MONTH, reported: X, resolved: Y}]
  const issuesTimeline = Object.entries(apiResponse.issues_by_month || {}).map(([date, data]) => {
    // Handle both the old format (direct count) and new format (object with reported/resolved)
    if (typeof data === 'object' && data !== null) {
      return {
        date,
        reported: data.reported || 0,
        resolved: data.resolved || 0
      };
    } else {
      // Fallback for backward compatibility with old format
      return {
        date,
        reported: typeof data === 'number' ? data : 0,
        resolved: 0
      };
    }
  });

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
  const theme = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [issues, setIssues] = useState([]);
  const [engineerData, setEngineerData] = useState([]);
  const [resolutionTimeData, setResolutionTimeData] = useState(null);
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

          // Fetch engineer performance data
          try {
            const engineerResponse = await analyticsService.getEngineerPerformance();
            console.log('Engineer performance response:', engineerResponse.data);
            setEngineerData(engineerResponse.data || []);
          } catch (engineerError) {
            console.error('Error fetching engineer performance:', engineerError);
            setEngineerData([]);
          }

          // Fetch resolution time data
          try {
            const resolutionTimeResponse = await analyticsService.getResolutionTime();
            console.log('Resolution time response:', resolutionTimeResponse.data);
            
            // Store the resolution time data
            if (resolutionTimeResponse.data) {
              setResolutionTimeData(resolutionTimeResponse.data);
              
              // Update the analytics object with the overall resolution time as a string
              if (typeof resolutionTimeResponse.data.OVERALL === 'string') {
                setAnalytics(prev => ({
                  ...prev,
                  avgResolutionTime: resolutionTimeResponse.data.OVERALL
                }));
              }
            }
          } catch (resolutionTimeError) {
            console.error('Error fetching resolution time:', resolutionTimeError);
            setResolutionTimeData(null);
          }

          // Fetch open (NEW) issues
          try {
            const issuesResponse = await issuesService.getAllIssues(1, 20);
            console.log('Issues API response:', issuesResponse.data);

            // Determine the structure of the response and extract the issues array
            let allIssues = [];
            
            console.log('Response data type:', typeof issuesResponse.data);
            
            if (Array.isArray(issuesResponse.data)) {
              console.log('Data is an array');
              allIssues = issuesResponse.data;
            } else if (issuesResponse.data && typeof issuesResponse.data === 'object') {
              if (Array.isArray(issuesResponse.data.data)) {
                console.log('Data is an object with data array');
                allIssues = issuesResponse.data.data;
              } else if (Array.isArray(issuesResponse.data.issues)) {
                console.log('Data is an object with issues array');
                allIssues = issuesResponse.data.issues;
              } else {
                // If it's a single issue object
                console.log('Data may be a single issue or unknown format');
                if (issuesResponse.data.id) {
                  allIssues = [issuesResponse.data];
                }
              }
            }
            
            console.log('Extracted all issues:', allIssues);
            
            // Filter to only NEW status issues, being case-insensitive
            const newIssues = allIssues.filter(issue => {
              const status = issue.status || '';
              return status.toUpperCase() === 'NEW';
            });
            
            console.log('Filtered NEW issues:', newIssues);
            setIssues(newIssues);
            
            if (newIssues.length === 0) {
              console.warn('No NEW issues found. Check if issues have NEW status in the database.');
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

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const cardAnimation = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 10 
      } 
    }
  };

  return (
    <MotionContainer 
      maxWidth="lg" 
      sx={{ py: 4 }}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Header Section */}
      <MotionBox 
        sx={{ 
          mb: 4, 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
        variants={fadeIn}
      >
        <MotionTypography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Staff Dashboard
        </MotionTypography>
        <Divider sx={{ width: '100px', borderWidth: 2, borderColor: theme.palette.primary.main, mb: 3 }} />
      </MotionBox>

      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 4, 
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: theme.palette.error.main,
            border: `1px solid ${theme.palette.error.light}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}

      {/* Date Range Selector */}
      <MotionPaper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
        }}
        variants={fadeIn}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Filter Data by Date Range
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              id="endDate"
              name="endDate"
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
        </Grid>
      </MotionPaper>

      {/* Summary Cards */}
      <MotionGrid 
        container 
        spacing={3} 
        sx={{ mb: 4 }}
        variants={staggerContainer}
      >
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard 
            elevation={2}
            variants={cardAnimation}
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              borderTop: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  mr: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main
                }}>
                  <TrendingUpIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Total Issues</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {analytics?.totalIssues || 0}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard 
            elevation={2}
            variants={cardAnimation}
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              borderTop: `4px solid ${theme.palette.success.main}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  mr: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main
                }}>
                  <CheckCircleIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Resolved Issues</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {analytics?.resolvedIssues || 0}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard 
            elevation={2}
            variants={cardAnimation}
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              borderTop: `4px solid ${theme.palette.warning.main}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  mr: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: theme.palette.warning.main
                }}>
                  <PendingIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Pending Issues</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {analytics?.pendingIssues || 0}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard 
            elevation={2}
            variants={cardAnimation}
            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              borderTop: `4px solid ${theme.palette.info.main}`
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  display: 'flex',
                  mr: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main
                }}>
                  <ScheduleIcon fontSize="large" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Avg. Resolution Time</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {typeof analytics?.avgResolutionTime === 'string' ? analytics.avgResolutionTime : 
                 (resolutionTimeData && typeof resolutionTimeData.OVERALL === 'string' ? resolutionTimeData.OVERALL : 'N/A')}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </MotionGrid>

      {/* Charts Section */}
      <MotionGrid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <MotionCard 
            elevation={2}
            variants={fadeIn}
            sx={{ 
              height: '100%', 
              borderRadius: 2,
              overflow: 'hidden' 
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Issues by Type
              </Typography>
              <Box sx={{ height: 450, width: '100%', maxWidth: '100%' }}>
                <IssueTypeChart data={analytics?.issuesByType || []} />
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <MotionCard 
            elevation={2}
            variants={fadeIn}
            sx={{ 
              height: '100%', 
              borderRadius: 2,
              overflow: 'hidden' 
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Issues by Status
              </Typography>
              <Box sx={{ height: 450, width: '100%', maxWidth: '100%' }}>
                <IssueStatusChart data={analytics?.issuesByStatus || []} />
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </MotionGrid>

      {/* Timeline Chart */}
      <MotionCard 
        elevation={2}
        variants={fadeIn}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden' 
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Issues Timeline
          </Typography>
          <Box sx={{ height: 350 }}>
            <TimelineChart data={analytics?.issuesTimeline || []} />
          </Box>
        </CardContent>
      </MotionCard>

      {/* Average Resolution Time by Issue Type */}
      {resolutionTimeData && (
        <MotionCard 
          elevation={2}
          variants={fadeIn}
          sx={{ 
            mb: 4, 
            borderRadius: 2,
            overflow: 'hidden' 
          }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Average Resolution Time by Issue Type
            </Typography>
            <Box sx={{ height: 350 }}>
              <ResolutionTimeChart data={resolutionTimeData} />
            </Box>
          </CardContent>
        </MotionCard>
      )}

      {/* Engineer Performance */}
      <MotionCard 
        elevation={2}
        variants={fadeIn}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden' 
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Engineer Performance
          </Typography>
          {engineerData && engineerData.length > 0 ? (
            <StaffPerformance data={engineerData} />
          ) : (
            <Box sx={{ 
              p: 4, 
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {loading ? 'Loading engineer data...' : 'No engineer performance data available'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      {/* Open Issues */}
      <MotionCard 
        elevation={2}
        variants={fadeIn}
        sx={{ 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden' 
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Open Issues
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Issues with NEW status that require attention
          </Typography>
          
          {!Array.isArray(issues) || issues.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No open issues found
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reported By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issues.map((issue) => (
                    <TableRow 
                      key={issue.id || `issue-${Math.random()}`}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
                      <TableCell>{issue.id || 'N/A'}</TableCell>
                      <TableCell>{(issue.type && typeof issue.type === 'string' ?
                        issue.type.replace(/_/g, ' ') : 'N/A')}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          ...(issue.status === 'RESOLVED' ? {
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.dark
                            } : issue.status === 'PENDING' ? {
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                              color: theme.palette.warning.dark
                            } : issue.status === 'CLOSED' ? {
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.dark
                            } : {
                              bgcolor: alpha(theme.palette.grey[500], 0.1),
                              color: theme.palette.grey[700]
                            }
                          )
                        }}>
                          {issue.status || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell>{issue.reported_by || 'N/A'}</TableCell>
                      <TableCell>{issue.assigned_to || 'Unassigned'}</TableCell>
                      <TableCell>{issue.created_at ?
                        new Date(issue.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          disabled={!issue.id}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </MotionCard>
    </MotionContainer>
  );
};

export default DashboardPage;
