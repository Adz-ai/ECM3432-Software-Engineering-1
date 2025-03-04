// src/utils/validators.js

/**
 * Email validation
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation (at least 8 characters with 1 uppercase, 1 lowercase, 1 number)
 * @param {string} password - The password to validate
 * @returns {boolean} Whether the password meets complexity requirements
 */
export const isValidPassword = (password) => {
  // At least 8 characters, with at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate coordinate (latitude or longitude)
 * @param {number} coord - The coordinate to validate
 * @param {string} type - 'lat' or 'lng'
 * @returns {boolean} Whether the coordinate is valid
 */
export const isValidCoordinate = (coord, type = 'lat') => {
  if (typeof coord !== 'number') return false;

  if (type === 'lat') {
    return coord >= -90 && coord <= 90;
  }

  if (type === 'lng') {
    return coord >= -180 && coord <= 180;
  }

  return false;
};

/**
 * Validate issue form data
 * @param {Object} formData - The form data to validate
 * @returns {Object} An object with isValid flag and errors object
 */
export const validateIssueForm = (formData) => {
  const errors = {};

  // Validate type
  if (!formData.type) {
    errors.type = 'Issue type is required';
  }

  // Validate description
  if (!formData.description) {
    errors.description = 'Description is required';
  } else if (formData.description.length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  // Validate location
  if (!formData.location) {
    errors.location = 'Location is required';
  } else {
    if (!isValidCoordinate(formData.location.latitude, 'lat')) {
      errors.latitude = 'Invalid latitude';
    }
    if (!isValidCoordinate(formData.location.longitude, 'lng')) {
      errors.longitude = 'Invalid longitude';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
