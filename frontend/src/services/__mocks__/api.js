// Mock API service for testing

// Mock auth service
export const authService = {
  login: jest.fn().mockImplementation((credentials) => {
    // Extract username and password consistently regardless of parameter format
    const username = typeof credentials === 'object' ? credentials.username : credentials;
    const password = typeof credentials === 'object' ? credentials.password : arguments[1];
    
    // Default successful response that all tests should expect
    return Promise.resolve({
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwidXNlcl90eXBlIjoic3RhZmYiLCJpYXQiOjE2MzA1MTIwMDAsImV4cCI6MTYzMDU5ODQwMH0.nYYa3-39q9xZV93u4CfwRQERYCBP7kHkzPAm5o9JW0E',
        user: {
          id: 1,
          username: username || 'testuser',
          is_staff: true,
          userType: 'STAFF'
        }
      }
    });
  }),
  register: jest.fn().mockResolvedValue({ success: true }),
  logout: jest.fn(),
  verifyToken: jest.fn().mockResolvedValue({ isValid: true }),
};

// Mock analytics service
export const analyticsService = {
  getIssueTypeBreakdown: jest.fn().mockResolvedValue([
    { type: 'POTHOLE', count: 5 },
    { type: 'STREETLIGHT', count: 3 },
  ]),
  getIssueStatusBreakdown: jest.fn().mockResolvedValue([
    { status: 'NEW', count: 5 },
    { status: 'IN_PROGRESS', count: 3 },
    { status: 'RESOLVED', count: 2 },
  ]),
  getIssueTimeline: jest.fn().mockResolvedValue([
    { date: '2023-01-01', count: 3 },
    { date: '2023-01-02', count: 5 },
    { date: '2023-01-03', count: 2 },
  ]),
  getStaffPerformance: jest.fn().mockResolvedValue([
    { staffId: 1, name: 'Staff 1', resolvedCount: 5, averageResolutionTime: 24 },
    { staffId: 2, name: 'Staff 2', resolvedCount: 3, averageResolutionTime: 12 },
  ]),
  getAverageResolutionTime: jest.fn().mockResolvedValue({
    average: 24,
    byType: [
      { type: 'POTHOLE', averageHours: 30 },
      { type: 'STREETLIGHT', averageHours: 18 },
    ]
  }),
};

// Mock issues service
export const issuesService = {
  getIssues: jest.fn().mockResolvedValue({
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
  }),
  getIssueById: jest.fn().mockImplementation((id) => 
    Promise.resolve({
      id,
      type: 'POTHOLE',
      status: 'NEW',
      description: 'Test issue',
      location: { latitude: 51.5074, longitude: -0.1278 },
      reportedBy: 'citizen1',
      createdAt: '2023-01-01T12:00:00Z',
      images: ['test-image.jpg']
    })
  ),
  createIssue: jest.fn().mockImplementation((issueData) => 
    Promise.resolve({
      id: 123,
      ...issueData,
      createdAt: '2023-01-01T12:00:00Z',
      status: 'NEW',
    })
  ),
  updateIssue: jest.fn().mockImplementation((id, updateData) => 
    Promise.resolve({
      id,
      ...updateData,
      updatedAt: '2023-01-01T12:00:00Z',
    })
  ),
  deleteIssue: jest.fn().mockResolvedValue({ success: true }),
};

// Mock user service
export const userService = {
  getUserProfile: jest.fn().mockResolvedValue({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    userType: 'CITIZEN',
  }),
  updateUserProfile: jest.fn().mockImplementation((userData) => 
    Promise.resolve({
      id: 1,
      ...userData,
      updatedAt: '2023-01-01T12:00:00Z',
    })
  ),
};

// Mock file service
export const fileService = {
  uploadFile: jest.fn().mockResolvedValue({
    fileId: 'test-file-id',
    url: 'https://example.com/test-file.jpg',
  }),
};

// Default export for the entire API
export default {
  authService,
  analyticsService,
  issuesService,
  userService,
  fileService,
};
