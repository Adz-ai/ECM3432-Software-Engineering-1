// src/utils/constants.ts

/**
 * Application constants
 */

// Issue Types
export const ISSUE_TYPES = {
  POTHOLE: 'POTHOLE',
  STREET_LIGHT: 'STREET_LIGHT',
  GRAFFITI: 'GRAFFITI',
  ANTI_SOCIAL: 'ANTI_SOCIAL',
  FLY_TIPPING: 'FLY_TIPPING',
  BLOCKED_DRAIN: 'BLOCKED_DRAIN',
} as const;

export type IssueType = typeof ISSUE_TYPES[keyof typeof ISSUE_TYPES];

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  [ISSUE_TYPES.POTHOLE]: 'Pothole',
  [ISSUE_TYPES.STREET_LIGHT]: 'Street Light',
  [ISSUE_TYPES.GRAFFITI]: 'Graffiti',
  [ISSUE_TYPES.ANTI_SOCIAL]: 'Anti-Social Behavior',
  [ISSUE_TYPES.FLY_TIPPING]: 'Fly-Tipping',
  [ISSUE_TYPES.BLOCKED_DRAIN]: 'Blocked Drain',
};

// Issue Statuses
export const ISSUE_STATUSES = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
} as const;

export type IssueStatus = typeof ISSUE_STATUSES[keyof typeof ISSUE_STATUSES];

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  [ISSUE_STATUSES.NEW]: 'New',
  [ISSUE_STATUSES.IN_PROGRESS]: 'In Progress',
  [ISSUE_STATUSES.RESOLVED]: 'Resolved',
};

export const ISSUE_STATUS_COLORS: Record<IssueStatus, string> = {
  [ISSUE_STATUSES.NEW]: '#17a2b8', // info
  [ISSUE_STATUSES.IN_PROGRESS]: '#ffc107', // warning
  [ISSUE_STATUSES.RESOLVED]: '#28a745', // success secondary
};

// Map settings
export const MAP_DEFAULT_CENTER: [number, number] = [50.7184, -3.5339]; // Exeter city center
export const MAP_DEFAULT_ZOOM = 13;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  NOTIFICATIONS: 'notifications_dismissed',
} as const;

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REPORT: '/report',
  ISSUE_DETAIL: '/issues/:id',
  DASHBOARD: '/dashboard',
  ABOUT: '/about',
  NOT_FOUND: '*',
} as const;

