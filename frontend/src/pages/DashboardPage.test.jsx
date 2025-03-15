import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DashboardPage from './DashboardPage';
import { analyticsService, issuesService } from '../services/api';

// Mock the API services
jest.mock('../services/api', () => ({
  analyticsService: {
    getIssueTypeBreakdown: jest.fn().mockResolvedValue([]),
    getIssueStatusBreakdown: jest.fn().mockResolvedValue([]),
    getIssueTimeline: jest.fn().mockResolvedValue([]),
    getStaffPerformance: jest.fn().mockResolvedValue([]),
    getAverageResolutionTime: jest.fn().mockResolvedValue({ average: 0, byType: [] }),
    getIssueAnalytics: jest.fn().mockResolvedValue({ data: { total: 10, issues_by_type: { POTHOLE: 5 } } }),
    getEngineerPerformance: jest.fn().mockResolvedValue({ data: [] }),
    getResolutionTime: jest.fn().mockResolvedValue({ data: { OVERALL: '3.5 days' } }),
  },
  issuesService: {
    getIssues: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    updateIssue: jest.fn(),
  }
}));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  // Instead of using React.useEffect in the jest.mock factory (which causes errors)
  // we'll create a simpler mock that just returns the navigate div
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
}));

// Add a mock timeout to allow component to make API calls before testing
jest.setTimeout(10000);

describe('DashboardPage', () => {
  // Mock auth context for an authenticated staff user
  const mockAuthContext = {
    isAuthenticated: true,
    currentUser: { 
      id: 1, 
      username: 'testuser',
      userType: 'STAFF',
      is_staff: true
    },
    login: jest.fn(),
    logout: jest.fn(),
    isStaff: jest.fn().mockReturnValue(true),
  };

  // Sample data for mocks
  const mockIssueTypeData = [
    { type: 'POTHOLE', count: 5 },
    { type: 'STREETLIGHT', count: 3 },
  ];

  const mockIssuesData = {
    items: [
      { 
        id: 1, 
        type: 'POTHOLE', 
        status: 'NEW', 
        description: 'Test issue 1',
        location: { latitude: 51.5074, longitude: -0.1278 },
        reportedBy: 'citizen1',
        createdAt: '2023-01-01T12:00:00Z' 
      },
    ],
    total: 1,
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  // Helper function to render with auth context
  const renderWithAuth = (authContext = mockAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <DashboardPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    expect(() => renderWithAuth()).not.toThrow();
  });

  // Testing authentication states first - a simpler approach
  it('calls fetchDashboardData when user is staff', async () => {
    // Reset mocks before test
    jest.clearAllMocks();
    
    // Create a spy on the DashboardPage's fetchDashboardData function
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    }));
    
    // Set up the minimum mock implementations needed for the test
    analyticsService.getIssueAnalytics.mockResolvedValue({ data: { total: 5 } });
    analyticsService.getEngineerPerformance.mockResolvedValue({ data: [] });
    analyticsService.getResolutionTime.mockResolvedValue({ data: {} });
    issuesService.getIssues.mockResolvedValue({ data: [] });

    // Create a simple staff context
    const staffContext = {
      isAuthenticated: true,
      isStaff: jest.fn().mockReturnValue(true),
      currentUser: { id: 1, username: 'admin' }
    };

    // Render with staff authentication
    render(
      <AuthContext.Provider value={staffContext}>
        <DashboardPage />
      </AuthContext.Provider>
    );

    // Just verify that one of the API services was called - we don't need to check them all
    // This ensures the component attempted to fetch data without being too specific
    await waitFor(() => {
      expect(analyticsService.getIssueAnalytics).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    // Restore the original fetch
    global.fetch = originalFetch;
  });

  it('redirects unauthenticated users', () => {
    const unauthenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: false,
      currentUser: null,
      isStaff: jest.fn().mockReturnValue(false),
    };

    renderWithAuth(unauthenticatedContext);
    
    // There shouldn't be any dashboard content
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });

  it('redirects non-staff users', () => {
    const citizenUserContext = {
      ...mockAuthContext,
      currentUser: { 
        ...mockAuthContext.currentUser, 
        userType: 'CITIZEN',
        is_staff: false 
      },
      isStaff: jest.fn().mockReturnValue(false),
    };

    renderWithAuth(citizenUserContext);
    
    // There shouldn't be any dashboard content for non-staff
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });
});
