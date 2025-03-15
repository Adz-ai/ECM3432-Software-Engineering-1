# Testing Strategy

This document outlines the testing strategy implemented for the Chalkstone Council application, detailing the various testing methodologies, tools, and best practices used to ensure code quality and application reliability.

## Table of Contents

1. [Overview](#overview)
2. [Frontend Testing](#frontend-testing)
3. [Backend Testing](#backend-testing)
4. [Testing Tools](#testing-tools)
5. [Testing Types](#testing-types)
6. [Test Organization](#test-organization)
7. [Continuous Integration](#continuous-integration)
8. [Best Practices](#best-practices)

## Overview

Our testing strategy is designed to provide comprehensive coverage of both frontend and backend components, ensuring that:

- Components render correctly and maintain functionality
- Business logic behaves as expected
- API interactions function properly
- User flows work end-to-end
- Regressions are caught before deployment

## Frontend Testing

### React Component Testing

We use Jest and React Testing Library to test React components. Our approach to component testing includes:

#### Unit Tests
- Individual component testing in isolation
- Validation of props and state handling
- Event handling and user interactions

#### Integration Tests
- Testing component interactions
- Form submission flows
- Context providers and consumers
- API interaction mocks

### Test Structure

Frontend tests follow this structure:
1. **Setup**: Render components with necessary props and contexts
2. **Interaction**: Simulate user events (clicks, inputs, etc.)
3. **Assertion**: Verify the expected outcomes

### Key Components Tested

- **Pages**: LoginPage, DashboardPage, etc.
- **Components**: IssueForm, NavBar, etc.
- **Contexts**: AuthContext
- **Utilities**: Validators

## Backend Testing

### Go Testing

The backend uses Go's built-in testing framework with a comprehensive set of specialized tools for robust testing:

- Unit tests for core business logic
- Database interaction tests with real and mock databases
- API endpoint testing with mocked dependencies
- Authentication and authorization tests
- End-to-end integration tests

### GoMock

We extensively use GoMock, a mocking framework for Go, to create mock implementations of interfaces:

- **Automatic Mock Generation**: Using `mockgen` to create mocks from interfaces
- **Controlled Behavior**: Precisely define how mock objects should behave during tests
- **Expectation Verification**: Verify that mocks were called as expected
- **Interface Mocking**: Mock database repositories, services, and external APIs

Example usage:
```go
func TestIssueService(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()
    
    mockRepo := mocks.NewMockIssueRepository(ctrl)
    mockRepo.EXPECT().GetIssueByID(gomock.Any()).Return(&models.Issue{ID: 1}, nil)
    
    service := service.NewIssueService(mockRepo)
    // Test service with mock repository
}
```

### Testcontainers

One of the most powerful testing tools we employ is Testcontainers, which provides lightweight, disposable instances of common databases and other services as Docker containers:

- **Real Database Testing**: Tests run against actual database instances, not simulations
- **Isolated Environments**: Each test gets its own clean container instance
- **Consistent Setup**: Standardized database initialization across all tests
- **PostgreSQL Containers**: Specifically used for our data storage tests
- **Redis Containers**: For testing caching mechanisms

Example implementation:
```go
func setupTestDatabase(t *testing.T) (*sql.DB, func()) {
    ctx := context.Background()
    
    // Start PostgreSQL container
    postgres, err := postgres.RunContainer(ctx,
        testcontainers.WithImage("postgres:13"),
        postgres.WithDatabase("testdb"),
        postgres.WithUsername("test"),
        postgres.WithPassword("test"),
    )
    require.NoError(t, err)
    
    // Connect to container
    connStr, err := postgres.ConnectionString(ctx)
    require.NoError(t, err)
    
    db, err := sql.Open("postgres", connStr)
    require.NoError(t, err)
    
    // Setup schema and test data
    // ...
    
    // Return cleanup function
    return db, func() {
        db.Close()
        postgres.Terminate(ctx)
    }
}
```

### Test Helpers

We maintain extensive test helper functions in:
- `internal/database/test_helpers.go` - Database initialization and cleanup
- `internal/database/test_utils.go` - Test data generation and validation
- `internal/mocks/` - Generated mock implementations

These provide utilities for test data setup, database mocking, and common testing operations, allowing for consistent and reliable test environments.

## Testing Tools

### Frontend Tools

- **Jest**: JavaScript testing framework
- **React Testing Library**: DOM testing utilities for React components
- **Jest-DOM**: Custom DOM element matchers
- **User-Event**: Advanced user event simulation
- **Mock Service Worker (MSW)**: API mocking

### Backend Tools

- **Go Testing Package**: Built-in testing framework for Go
- **Testify**: Extended assertions and suite support for Go tests
- **GoMock**: Interface mocking framework for isolating dependencies
- **Testcontainers**: Docker containers for integration testing with real databases
- **SQLMock**: SQL mock driver for database interaction testing
- **HTTPTest**: HTTP request/response testing utilities
- **Custom Mocks**: Hand-written mock implementations for complex scenarios

## Testing Types

### Unit Testing

Focuses on testing individual functions, methods, and components in isolation. Ensures that each piece works correctly on its own.

### Integration Testing

Tests the interaction between different parts of the application, such as:
- Component to component interactions
- Frontend to API interactions
- API to database interactions

### Functional Testing

Verifies that the application functions correctly from a user's perspective:
- User flows (login, issue creation, etc.)
- Form validations
- Error handling

### Regression Testing

Ensures that previously developed and tested software still performs correctly after changes:

#### Frontend Regression Testing
- **Snapshot Testing**: Using Jest snapshot testing to capture component renders and detect unexpected changes
- **Automated Test Suites**: Running the entire test suite before merging changes
- **Visual Regression**: Manual review of UI components to ensure visual consistency

#### Backend Regression Testing
- **API Contract Testing**: Ensuring API responses maintain expected structure and data types
- **Database Schema Validation**: Tests that verify schema changes don't break existing functionality
- **Integration Test Suite**: Comprehensive test cases covering all critical paths in the application

#### Implementation Approach
- Tests are automatically run on each commit to detect regressions early
- Historical test results are stored to identify patterns in failures
- Baseline snapshots are updated only after careful review of changes
- Test coverage reports highlight code paths that need additional regression tests

### Mock Testing

Uses mock objects to simulate dependencies:
- API services (axios mocks)
- External libraries (react-leaflet, recharts)
- Browser APIs (localStorage)

## Test Organization

Tests are organized to mirror the application structure:

```
src/
├── components/
│   └── ComponentName/
│       └── ComponentName.test.jsx
├── pages/
│   └── PageName/
│       └── PageName.test.jsx
├── contexts/
│   └── ContextName.test.jsx
└── utils/
    └── utilityName.test.js
```

## Continuous Integration

Our CI pipeline executes tests automatically on:
- Pull request creation
- Commits to main branch
- Pre-deployment checks

The CI pipeline includes specific steps for regression testing:
- Running the full test suite to catch any regressions
- Comparing results with previous runs to identify new failures
- Generating and storing test coverage reports
- Performing static code analysis to detect potential issues early

This ensures that tests are consistently run, regressions are caught early, and code quality is maintained throughout the development lifecycle.

## Best Practices

### Frontend Testing Best Practices

1. **Query Priority**: Use queries in this order for better test resilience:
   - Role-based queries (getByRole)
   - Label-based queries (getByLabelText)
   - Text-based queries (getByText)
   - Test IDs (getByTestId)

2. **User-Centric Testing**: Test from the user's perspective rather than implementation details

3. **Mocking Strategy**:
   - Mock external services and APIs
   - Provide default mock implementations in setupTests.js
   - Use specific mock returns for test-specific scenarios

4. **Test Isolation**:
   - Reset mocks between tests
   - Clean up any side effects
   - Avoid dependencies between tests

5. **Comprehensive Coverage**:
   - Test happy paths
   - Test error scenarios
   - Test edge cases
   - Test accessibility concerns

### Backend Testing Best Practices

1. **Test Independence**: Each test should run independently of others

2. **Database Testing**: Use test databases or mock implementations

3. **API Testing**: Test endpoints for correct responses and error handling

4. **Authentication**: Test both authenticated and unauthenticated scenarios
