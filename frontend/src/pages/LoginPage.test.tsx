/* eslint-disable react/prop-types */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { from: { pathname: '/' } } }),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to} data-testid="mock-link">{children}</a>,
  };
});

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockAuthContext = {
    login: mockLogin,
    error: null,
    isAuthenticated: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to render the component
  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    expect(() => renderLoginPage()).not.toThrow();
  });

  it('renders basic form elements', () => {
    renderLoginPage();
    
    // Look for input fields - more resilient selectors
    const usernameInput = screen.queryByLabelText(/username/i) || 
                         screen.queryByPlaceholderText(/username/i) || 
                         screen.queryByRole('textbox');
                         
    const passwordInput = screen.queryByLabelText(/password/i) || 
                         screen.queryByPlaceholderText(/password/i) ||
                         document.querySelector('input[type="password"]');
                         
    const submitButton = screen.queryByRole('button', { name: /sign|login|log in/i }) ||
                       screen.queryByText(/sign|login|log in/i);
    
    // Check that we found the critical elements
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    renderLoginPage();

    // Find the form - we need to submit it directly to bypass HTML5 validation
    const form = screen.getByRole('button').closest('form');
    if (!form) throw new Error('Form not found');

    // Submit empty form by triggering submit event
    fireEvent.submit(form);

    // Wait for validation message - the LoginPage shows "Username and password are required"
    await waitFor(() => {
      const errorMessage = screen.getByText(/username and password are required/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 100 });

    // Login should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('handles form submission with valid data', async () => {
    mockLogin.mockResolvedValueOnce({});
    renderLoginPage();

    // Find form elements
    const usernameInput = screen.getByLabelText(/username/i) || screen.getByRole('textbox');
    const passwordInput = screen.getByLabelText(/password/i) || document.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button');

    // Fill the form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Verify login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    }, { timeout: 1000 });
  });

  it('shows error messages on login failure', async () => {
    // Mock a login error
    const loginError = new Error('Invalid credentials');
    loginError.response = { data: { message: 'Invalid username or password' } };
    mockLogin.mockRejectedValueOnce(loginError);

    renderLoginPage();

    // Find and fill form elements
    const usernameInput = screen.getByLabelText(/username/i) || screen.getByRole('textbox');
    const passwordInput = screen.getByLabelText(/password/i) || document.querySelector('input[type="password"]');
    const submitButton = screen.getByRole('button');

    fireEvent.change(usernameInput, { target: { value: 'invalid' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      const errorElements = screen.getAllByText(/invalid|failed|error/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 1000 });
  });
});
