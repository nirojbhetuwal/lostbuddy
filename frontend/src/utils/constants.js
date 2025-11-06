// Application Constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Item Categories
export const ITEM_CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'documents', label: 'Documents' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
  { value: 'books', label: 'Books' },
  { value: 'keys', label: 'Keys' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'pets', label: 'Pets' },
  { value: 'other', label: 'Other' }
];

// Item Types
export const ITEM_TYPES = [
  { value: 'lost', label: 'Lost Item' },
  { value: 'found', label: 'Found Item' }
];

// Item Status
export const ITEM_STATUS = {
  OPEN: 'open',
  MATCHED: 'matched',
  CLAIMED: 'claimed',
  RETURNED: 'returned',
  CLOSED: 'closed'
};

export const ITEM_STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'blue' },
  { value: 'matched', label: 'Matched', color: 'yellow' },
  { value: 'claimed', label: 'Claimed', color: 'green' },
  { value: 'returned', label: 'Returned', color: 'gray' },
  { value: 'closed', label: 'Closed', color: 'gray' }
];

// Claim Status
export const CLAIM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const CLAIM_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' }
];

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  MATCH_FOUND: 'match_found',
  MATCH_CONFIRMED: 'match_confirmed',
  NEW_CLAIM: 'new_claim',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
  ITEM_STATUS_UPDATE: 'item_status_update',
  SYSTEM: 'system'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  LIMIT_OPTIONS: [12, 24, 36, 48]
};

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_COUNT: 4,
  ACCEPTED_FILE_TYPES: {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  }
};

// Form Validation
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30
  },
  PASSWORD: {
    MIN_LENGTH: 6
  },
  ITEM_TITLE: {
    MAX_LENGTH: 100
  },
  ITEM_DESCRIPTION: {
    MAX_LENGTH: 1000
  },
  CLAIM_MESSAGE: {
    MAX_LENGTH: 500
  },
  REJECTION_REASON: {
    MAX_LENGTH: 200
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'user',
  THEME_PREFERENCE: 'theme'
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  REPORT_ITEM: '/report-item',
  BROWSE_ITEMS: '/browse',
  ITEM_DETAILS: '/item/:id',
  MY_CLAIMS: '/my-claims',
  MANAGE_CLAIMS: '/manage-claims',
  ADMIN: '/admin'
};

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'hh:mm A'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ITEM_CREATED: 'Item reported successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
  CLAIM_SUBMITTED: 'Claim submitted successfully!',
  CLAIM_APPROVED: 'Claim approved successfully!',
  CLAIM_REJECTED: 'Claim rejected successfully!',
  CLAIM_CANCELLED: 'Claim cancelled successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// Demo Credentials (for development)
export const DEMO_CREDENTIALS = {
  USER: {
    email: 'demo@lostbuddy.com',
    password: 'demo123'
  },
  ADMIN: {
    email: 'admin@lostbuddy.com',
    password: 'admin123'
  }
};

// Feature Flags
export const FEATURE_FLAGS = {
  IMAGE_UPLOAD: true,
  NOTIFICATIONS: true,
  CLAIM_SYSTEM: true,
  ADMIN_DASHBOARD: true,
  SMART_MATCHING: true
};

export default {
  API_CONFIG,
  ITEM_CATEGORIES,
  ITEM_TYPES,
  ITEM_STATUS,
  ITEM_STATUS_OPTIONS,
  CLAIM_STATUS,
  CLAIM_STATUS_OPTIONS,
  USER_ROLES,
  NOTIFICATION_TYPES,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION,
  STORAGE_KEYS,
  ROUTES,
  THEME,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEMO_CREDENTIALS,
  FEATURE_FLAGS
};