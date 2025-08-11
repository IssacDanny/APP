/**
 * A centralized in-memory "database" for the MVP implementation.
 * It uses JavaScript Maps to simulate database tables and is pre-seeded with
 * realistic data for testing and development.
 */

// --- Configuration Store ---
export const configDb = new Map([
  ['maintenanceMode', { 
    key: 'maintenanceMode', 
    value: 'false', 
    description: 'Enable/disable site-wide maintenance mode.', 
    lastModified: new Date('2023-10-26T10:00:00Z').toISOString() 
  }],
  ['welcomeMessage', { 
    key: 'welcomeMessage', 
    value: 'Welcome to the Admin Panel!', 
    description: 'The message displayed on the main dashboard.', 
    lastModified: new Date('2023-10-26T10:05:00Z').toISOString() 
  }],
]);

// --- Users & Roles Store ---
export const usersDb = new Map([
  ['user-1', { 
    id: 'user-1', 
    email: 'admin@example.com', 
    // NOTE: For a real DB, you would store a hashed password, not the plain text.
    passwordHash: 'hashed_password_for_admin', 
    roles: ['admin', 'editor'] 
  }],
  ['user-2', { 
    id: 'user-2', 
    email: 'editor@example.com', 
    passwordHash: 'hashed_password_for_editor', 
    roles: ['editor'] 
  }],
  ['user-3', { 
    id: 'user-3', 
    email: 'viewer@example.com', 
    passwordHash: 'hashed_password_for_viewer', 
    roles: ['viewer'] 
  }],
]);

// --- Feature Flags Store ---
export const flagsDb = new Map([
  ['beta-dashboard', { 
    name: 'beta-dashboard', 
    description: 'Enables the new v2 dashboard for beta users.', 
    isEnabled: false 
  }],
  ['enable-dark-mode', { 
    name: 'enable-dark-mode', 
    description: 'Allows users to switch to dark mode.', 
    isEnabled: true 
  }],
]);

// --- Notifications Store ---
export const notificationTemplatesDb = new Map([
  ['welcome-email', { id: 'welcome-email', name: 'Welcome Email', type: 'email' }],
  ['password-reset-sms', { id: 'password-reset-sms', name: 'Password Reset SMS', type: 'sms' }],
]);

export const notificationHistoryDb = new Map([
  [1, { id: 1, timestamp: new Date('2023-11-01T14:30:00Z').toISOString(), recipient: 'editor@example.com', type: 'email', status: 'SENT' }],
  [2, { id: 2, timestamp: new Date('2023-11-01T15:00:00Z').toISOString(), recipient: '+15551234567', type: 'sms', status: 'FAILED' }],
]);

// --- Monitoring Store ---
export const metricsDb = []; // An array is simpler for time-series data

// --- Rate Limiting is handled by Redis and doesn't need a mock DB here ---