// src/utils/validators.ts

/**
 * Email validation
 * @param email - The email to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  // Using a more strict regex that checks for:
  // - No consecutive dots in domain
  // - Valid characters before and after @
  // - No spaces
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasConsecutiveDots = /@.*\.\./.test(email);

  return emailRegex.test(email) && !hasConsecutiveDots;
};

/**
 * Password validation (at least 8 characters with 1 uppercase, 1 lowercase, 1 number)
 * @param password - The password to validate
 * @returns Whether the password meets complexity requirements
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, with at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate coordinate (latitude or longitude)
 * @param coord - The coordinate to validate
 * @param type - 'lat' or 'lng'
 * @returns Whether the coordinate is valid
 */
export const isValidCoordinate = (coord: number, type?: 'lat' | 'lng'): boolean => {
  // Check if coordinate is a valid number
  if (typeof coord !== 'number' || isNaN(coord) || !isFinite(coord)) {
    return false;
  }

  // When 'lat' type is specified
  if (type === 'lat') {
    return coord >= -90 && coord <= 90;
  }

  // When 'lng' type is specified
  if (type === 'lng') {
    return coord >= -180 && coord <= 180;
  }

  // When type is not provided, default to latitude validation
  if (type === undefined) {
    return coord >= -90 && coord <= 90;
  }

  // All other inputs (invalid type)
  return false;
};

interface IssueFormData {
  type?: string;
  description?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
}

interface ValidationErrors {
  form?: string;
  type?: string;
  description?: string;
  location?: string | {
    latitude?: string;
    longitude?: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Validate issue form data
 * @param formData - The form data to validate
 * @returns An object with isValid flag and errors object
 */
export const validateIssueForm = (formData: IssueFormData | null | undefined): ValidationResult => {
  const errors: ValidationErrors = {};

  // Guard against null or undefined formData
  if (!formData) {
    return {
      isValid: false,
      errors: { form: 'Form data is required' }
    };
  }

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
    // Safe check if location properties exist
    const latitude = formData.location.latitude;
    const longitude = formData.location.longitude;

    if (latitude !== undefined && !isValidCoordinate(latitude, 'lat')) {
      errors.location = errors.location || {};
      (errors.location as { latitude?: string }).latitude = 'Invalid latitude';
    }

    if (longitude !== undefined && !isValidCoordinate(longitude, 'lng')) {
      errors.location = errors.location || {};
      (errors.location as { longitude?: string }).longitude = 'Invalid longitude';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
