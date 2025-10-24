// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    is_staff: false,
    staff_secret: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Only validate that the staff secret is provided if user is registering as staff
    // The actual validation will happen on the server side
    if (formData.is_staff && !formData.staff_secret) {
      setError('Staff secret phrase is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Register the user
      await authService.register({
        username: formData.username,
        password: formData.password,
        is_staff: formData.is_staff,
        // Send the staff secret to the backend for server-side validation
        staff_secret: formData.is_staff ? formData.staff_secret : undefined
      });

      // Navigate to login page after successful registration
      navigate('/login', {
        state: {
          message: 'Registration successful! Please login with your new account.'
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h1>Register</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group checkbox">
            <label htmlFor="is_staff">
              <input
                type="checkbox"
                id="is_staff"
                name="is_staff"
                checked={formData.is_staff}
                onChange={handleChange}
              />
              Register as council staff member
            </label>
          </div>

          {formData.is_staff && (
            <div className="form-group">
              <label htmlFor="staff_secret">Staff Secret Phrase</label>
              <input
                type="password"
                id="staff_secret"
                name="staff_secret"
                value={formData.staff_secret}
                onChange={handleChange}
                required={formData.is_staff}
                placeholder="Enter the staff secret phrase"
              />
              <small className="form-text text-muted">
                A secret phrase is required to register as staff. This helps ensure only authorized personnel can access staff features.
              </small>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
