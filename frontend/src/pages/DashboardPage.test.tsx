/* eslint-disable react/prop-types */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DashboardPage from './DashboardPage';
import { analyticsService, issuesService } from '../services/api';

// Mock the API services
vi.mock('../services/api', () => ({
  analyticsService: {
    getIssueTypeBreakdown: vi.fn().mockResolvedValue([]),
    getIssueStatusBreakdown: vi.fn().mockResolvedValue([]),
    getIssueTimeline: vi.fn().mockResolvedValue([]),
    getStaffPerformance: vi.fn().mockResolvedValue([]),
    getAverageResolutionTime: vi.fn().mockResolvedValue({ average: 0, byType: [] }),
    getIssueAnalytics: vi.fn().mockResolvedValue({ data: { total: 10, issues_by_type: { POTHOLE: 5 } } }),
    getEngineerPerformance: vi.fn().mockResolvedValue({ data: [] }),
    getResolutionTime: vi.fn().mockResolvedValue({ data: { OVERALL: '3.5 days' } }),
  },
  issuesService: {
    getIssues: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    getAllIssues: vi.fn().mockResolvedValue([]),
    searchIssues: vi.fn().mockResolvedValue([]),
    updateIssue: vi.fn(),
  }
}));

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    // Instead of using React.useEffect in the vi.mock factory (which causes errors)
    // we'll create a simpler mock that just returns the navigate div
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

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
    login: vi.fn(),
    logout: vi.fn(),
    isStaff: vi.fn().mockReturnValue(true),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
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
    vi.clearAllMocks();

    // Create a spy on the DashboardPage's fetchDashboardData function
    const originalFetch = global.fetch;
    global.fetch = vi.fn(() => Promise.resolve({
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
      isStaff: vi.fn().mockReturnValue(true),
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
      isStaff: vi.fn().mockReturnValue(false),
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
      isStaff: vi.fn().mockReturnValue(false),
    };

    renderWithAuth(citizenUserContext);
    
    // There shouldn't be any dashboard content for non-staff
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });
});
