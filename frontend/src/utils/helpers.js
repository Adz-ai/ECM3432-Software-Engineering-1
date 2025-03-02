// src/utils/helpers.js

/**
 * Format a date string to a readable format
 * @param {string} dateString - The ISO date string to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return 'Invalid date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('en-GB', options);
};

/**
 * Format an issue type string to be more readable
 * @param {string} type - The issue type
 * @returns {string} The formatted issue type
 */
export const formatIssueType = (type) => {
  if (!type) return '';

  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Format an issue status string to be more readable
 * @param {string} status - The issue status
 * @returns {string} The formatted issue status
 */
export const formatIssueStatus = (status) => {
  if (!status) return '';

  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Truncate a string if it's longer than maxLength
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated string
 */
export const truncateString = (str, maxLength = 100) => {
  if (!str) return '';

  if (str.length <= maxLength) return str;

  return str.substring(0, maxLength) + '...';
};

/**
 * Convert latitude/longitude to human-readable address (mock implementation)
 * In a real app, this would use a geocoding service like Google Maps or Nominatim
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} A human-readable address or coordinates as string
 */
export const getAddressFromCoordinates = (lat, lng) => {
  // This is a mock implementation - in a real app, you would use a geocoding service
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Generate a random ID (useful for temporary IDs before API responds)
 * @returns {string} A random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};
