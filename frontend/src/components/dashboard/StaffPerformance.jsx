// src/components/dashboard/StaffPerformance.jsx

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import {
  Box, Card, CardContent, Typography, Grid, Tabs, Tab, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Avatar, Badge, Stack, LinearProgress, Button
} from '@mui/material';
import {
  CheckCircleOutline, PendingActions, AssignmentInd, 
  AccessTime, Speed, Engineering
} from '@mui/icons-material';

// Colors for the pie charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const IssueTypePieChart = ({ data, title }) => {
  // Filter out any zero values to make the pie chart cleaner
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' '),
      value
    }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} issues`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary">No data available</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const PerformanceCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          backgroundColor: `${color}.light`, 
          borderRadius: '50%', 
          width: 40, 
          height: 40, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mr: 2 
        }}>
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const EngineerTable = ({ engineers }) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="engineer performance table" size="small">
        <TableHead>
          <TableRow>
            <TableCell>Engineer</TableCell>
            <TableCell align="center">Total Issues</TableCell>
            <TableCell align="center">Resolved</TableCell>
            <TableCell align="center">Assigned</TableCell>
            <TableCell align="center">Avg. Resolution Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {engineers.map((engineer) => (
            <TableRow key={engineer.id} hover>
              <TableCell component="th" scope="row">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                    {engineer.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {engineer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {engineer.specialization}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip label={engineer.totalIssues} color="primary" size="small" />
              </TableCell>
              <TableCell align="center">
                <Chip 
                  icon={<CheckCircleOutline fontSize="small" />} 
                  label={engineer.resolved} 
                  color="success" 
                  size="small" 
                />
              </TableCell>
              <TableCell align="center">
                <Chip 
                  icon={<PendingActions fontSize="small" />} 
                  label={engineer.assigned} 
                  color="warning" 
                  size="small" 
                />
              </TableCell>
              <TableCell align="center">
                <Chip 
                  icon={<AccessTime fontSize="small" />} 
                  label={engineer.avgTime || 'N/A'} 
                  color="info" 
                  size="small" 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const StaffPerformance = ({ data = [] }) => {
  const [tabValue, setTabValue] = useState(0);

  // If no data is provided, show a loading state or message
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Engineer Performance</Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Engineering sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="body1">No engineer data available</Typography>
        </Paper>
      </Box>
    );
  }

  // Transform engineer data for charts and tables
  const engineerTableData = data.map(engineer => ({
    id: engineer.engineer.id,
    name: engineer.engineer.name,
    specialization: engineer.engineer.specialization,
    resolved: engineer.issues_resolved,
    assigned: engineer.issues_assigned,
    totalIssues: engineer.total_issues,
    avgTime: engineer.avg_resolution_time
  }));

  // Get first engineer for detailed view
  const selectedEngineer = data[tabValue];

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h6" gutterBottom>Engineer Performance</Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <PerformanceCard 
            title="Total Engineers" 
            value={data.length} 
            icon={<Engineering color="primary" />} 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <PerformanceCard 
            title="Total Issues Handled" 
            value={data.reduce((sum, eng) => sum + eng.total_issues, 0)} 
            icon={<AssignmentInd color="secondary" />} 
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <PerformanceCard 
            title="Issues Resolved" 
            value={data.reduce((sum, eng) => sum + eng.issues_resolved, 0)} 
            icon={<CheckCircleOutline color="success" />} 
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <PerformanceCard 
            title="Currently Assigned" 
            value={data.reduce((sum, eng) => sum + eng.issues_assigned, 0)} 
            icon={<PendingActions color="warning" />} 
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Engineer Workload Comparison</Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={engineerTableData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [value, name === 'resolved' ? 'Resolved Issues' : 'Assigned Issues']} />
                    <Legend />
                    <Bar dataKey="resolved" name="Resolved Issues" fill="#82ca9d" />
                    <Bar dataKey="assigned" name="Assigned Issues" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Engineer Details</Typography>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                {data.map((eng, idx) => (
                  <Tab 
                    key={eng.engineer.id} 
                    label={eng.engineer.name.split(' ')[0]} 
                    value={idx} 
                    wrapped 
                  />
                ))}
              </Tabs>
              
              {selectedEngineer && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                      {selectedEngineer.engineer.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{selectedEngineer.engineer.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedEngineer.engineer.specialization} • {selectedEngineer.avg_resolution_time} avg. resolution time
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Total Issues</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedEngineer.total_issues}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={100} 
                        color="primary" 
                        sx={{ height: 8, borderRadius: 5 }} 
                      />
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Resolved</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedEngineer.issues_resolved} ({Math.round(selectedEngineer.issues_resolved / selectedEngineer.total_issues * 100 || 0)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedEngineer.issues_resolved / selectedEngineer.total_issues * 100 || 0} 
                        color="success" 
                        sx={{ height: 8, borderRadius: 5 }} 
                      />
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Assigned</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {selectedEngineer.issues_assigned} ({Math.round(selectedEngineer.issues_assigned / selectedEngineer.total_issues * 100 || 0)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedEngineer.issues_assigned / selectedEngineer.total_issues * 100 || 0} 
                        color="warning" 
                        sx={{ height: 8, borderRadius: 5 }} 
                      />
                    </Box>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <IssueTypePieChart 
            data={selectedEngineer?.resolved_issues_by_type || {}} 
            title="Resolved Issues by Type" 
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <IssueTypePieChart 
            data={selectedEngineer?.assigned_issues_by_type || {}} 
            title="Assigned Issues by Type" 
          />
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>All Engineers</Typography>
              <EngineerTable engineers={engineerTableData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffPerformance;
