// src/utils/helpers.ts

/**
 * Format a date string to a readable format
 * @param dateString - The ISO date string to format
 * @param includeTime - Whether to include the time
 * @returns The formatted date string
 */
export const formatDate = (dateString: string | null | undefined, includeTime = false): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return 'Invalid date';

  const options: Intl.DateTimeFormatOptions = {
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
 * @param type - The issue type
 * @returns The formatted issue type
 */
export const formatIssueType = (type: string | null | undefined): string => {
  if (!type) return '';

  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Format an issue status string to be more readable
 * @param status - The issue status
 * @returns The formatted issue status
 */
export const formatIssueStatus = (status: string | null | undefined): string => {
  if (!status) return '';

  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Truncate a string if it's longer than maxLength
 * @param str - The string to truncate
 * @param maxLength - The maximum length
 * @returns The truncated string
 */
export const truncateString = (str: string | null | undefined, maxLength = 100): string => {
  if (!str) return '';

  if (str.length <= maxLength) return str;

  return str.substring(0, maxLength) + '...';
};

/**
 * Convert latitude/longitude to human-readable address (mock implementation)
 * In a real app, this would use a geocoding service like Google Maps or Nominatim
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns A human-readable address or coordinates as string
 */
export const getAddressFromCoordinates = (lat: number, lng: number): string => {
  // This is a mock implementation - in a real app, you would use a geocoding service
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Generate a random ID (useful for temporary IDs before API responds)
 * @returns A random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
