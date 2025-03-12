// src/services/mockApiAdapter.js
// This file provides mock data for testing when your real API is not available

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ISSUE_TYPES, ISSUE_STATUSES } from '../utils/constants';

// Create a mock adapter for testing
const createMockApi = (api) => {
  const mock = new MockAdapter(api, { delayResponse: 500 });

  // Mock user data
  const users = [
    { username: 'user1', password: 'password', is_staff: false },
    { username: 'staff1', password: 'password', is_staff: true },
  ];

  // Mock issues data
  const issues = [
    {
      id: 1,
      type: ISSUE_TYPES.POTHOLE,
      status: ISSUE_STATUSES.IN_PROGRESS,
      description: 'Large pothole on High Street near the library',
      location: { latitude: 50.7184, longitude: -3.5339 },
      reported_by: 'user1',
      assigned_to: 'staff1',
      created_at: '2025-02-15T10:30:00Z',
      updated_at: '2025-02-16T09:45:00Z',
      images: [],
    },
    {
      id: 2,
      type: ISSUE_TYPES.STREET_LIGHT,
      status: ISSUE_STATUSES.NEW,
      description: 'Street light not working on Queen Street',
      location: { latitude: 50.7214, longitude: -3.5350 },
      reported_by: 'user1',
      assigned_to: null,
      created_at: '2025-02-18T14:20:00Z',
      updated_at: '2025-02-18T14:20:00Z',
      images: [],
    },
    {
      id: 3,
      type: ISSUE_TYPES.GRAFFITI,
      status: ISSUE_STATUSES.RESOLVED,
      description: 'Graffiti on wall next to bus stop',
      location: { latitude: 50.7150, longitude: -3.5320 },
      reported_by: 'user1',
      assigned_to: 'staff1',
      created_at: '2025-02-10T09:15:00Z',
      updated_at: '2025-02-14T16:30:00Z',
      images: [],
    },
  ];

  // Mock analytics data
  const analytics = {
    totalIssues: 128,
    resolvedIssues: 87,
    pendingIssues: 41,
    avgResolutionTime: '15.3 days',
    issuesByType: [
      { type: ISSUE_TYPES.POTHOLE, count: 45 },
      { type: ISSUE_TYPES.STREET_LIGHT, count: 32 },
      { type: ISSUE_TYPES.GRAFFITI, count: 22 },
      { type: ISSUE_TYPES.ANTI_SOCIAL, count: 15 },
      { type: ISSUE_TYPES.FLY_TIPPING, count: 10 },
      { type: ISSUE_TYPES.BLOCKED_DRAIN, count: 4 },
    ],
    issuesByStatus: [
      { status: ISSUE_STATUSES.NEW, count: 9 },
      { status: ISSUE_STATUSES.IN_PROGRESS, count: 32 },
      { status: ISSUE_STATUSES.RESOLVED, count: 35 },
    ],
    issuesTimeline: [
      { date: '2025-01', reported: 22, resolved: 18 },
      { date: '2025-02', reported: 27, resolved: 25 },
      { date: '2025-03', reported: 31, resolved: 24 },
      { date: '2025-04', reported: 24, resolved: 30 },
      { date: '2025-05', reported: 18, resolved: 22 },
      { date: '2025-06', reported: 6, resolved: 8 },
    ],
    staffPerformance: [
      { staffName: 'John Smith', assigned: 35, resolved: 32 },
      { staffName: 'Emma Wilson', assigned: 28, resolved: 25 },
      { staffName: 'Mark Davies', assigned: 22, resolved: 18 },
      { staffName: 'Sarah Johnson', assigned: 15, resolved: 12 },
    ],
  };

  // Mock map issues
  const mapIssues = issues.map(issue => ({
    id: issue.id,
    type: issue.type,
    status: issue.status,
    location: issue.location,
  }));

  // Set up mock endpoints

  // Authentication
  mock.onPost('/auth/login').reply((config) => {
    try {
      const credentials = JSON.parse(config.data);
      const user = users.find(
        u => u.username === credentials.username && u.password === credentials.password
      );

      if (user) {
        return [
          200,
          {
            token: `mock-jwt-token-${user.username}`,
            user: {
              username: user.username,
              is_staff: user.is_staff
            }
          }
        ];
      }

      return [401, { message: 'Invalid credentials' }];
    } catch (error) {
      console.error('Mock login error:', error);
      return [400, { message: 'Invalid request format' }];
    }
  });

  mock.onPost('/auth/register').reply((config) => {
    try {
      const userData = JSON.parse(config.data);

      if (!userData.username || !userData.password) {
        return [400, { message: 'Username and password are required' }];
      }

      // Check if username already exists
      if (users.some(u => u.username === userData.username)) {
        return [400, { message: 'Username already exists' }];
      }

      // Add new user
      users.push({
        username: userData.username,
        password: userData.password,
        is_staff: !!userData.is_staff,
      });

      return [200, { message: 'User registered successfully' }];
    } catch (error) {
      console.error('Mock register error:', error);
      return [400, { message: 'Invalid request format' }];
    }
  });

  // Issues
  mock.onGet(/\/issues\?page=\d+&pageSize=\d+/).reply(200, issues);

  mock.onGet(/\/issues\/\d+/).reply((config) => {
    const id = parseInt(config.url.split('/').pop());
    const issue = issues.find(i => i.id === id);

    if (issue) {
      return [200, issue];
    }

    return [404, { message: 'Issue not found' }];
  });

  mock.onPost('/issues').reply((config) => {
    try {
      const issueData = JSON.parse(config.data);

      // Validate required fields
      if (!issueData.type || !issueData.description || !issueData.location) {
        return [400, { message: 'Missing required fields' }];
      }

      // Create new issue
      const newIssue = {
        id: issues.length + 1,
        ...issueData,
        status: ISSUE_STATUSES.NEW,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      issues.push(newIssue);

      return [201, { id: newIssue.id }];
    } catch (error) {
      console.error('Mock create issue error:', error);
      return [400, { message: 'Invalid request format' }];
    }
  });

  mock.onPut(/\/issues\/\d+/).reply((config) => {
    try {
      const id = parseInt(config.url.split('/').pop());
      const updateData = JSON.parse(config.data);
      const issueIndex = issues.findIndex(i => i.id === id);

      if (issueIndex === -1) {
        return [404, { message: 'Issue not found' }];
      }

      // Update issue
      issues[issueIndex] = {
        ...issues[issueIndex],
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      return [200, { message: 'Issue updated successfully' }];
    } catch (error) {
      console.error('Mock update issue error:', error);
      return [400, { message: 'Invalid request format' }];
    }
  });

  // Map issues
  mock.onGet('/issues/map').reply(200, mapIssues);

  // Analytics
  mock.onGet(/\/issues\/analytics/).reply(200, analytics);

  // Search
  mock.onGet(/\/issues\/search/).reply((config) => {
    const params = new URLSearchParams(config.url.split('?')[1]);
    const type = params.get('type');
    const status = params.get('status');

    let filteredIssues = [...issues];

    if (type) {
      filteredIssues = filteredIssues.filter(i => i.type === type);
    }

    if (status) {
      filteredIssues = filteredIssues.filter(i => i.status === status);
    }

    return [200, filteredIssues];
  });

  return mock;
};

export default createMockApi;
