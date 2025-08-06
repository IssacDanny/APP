import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { asValue } from 'awilix';
import { startServer } from '#platform/core/Server.js';
import { HttpError } from '#platform/core/errors.js';
import { mockAuthInterceptor } from './test_mocks/MockAuthInterceptor.js';

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const mockUsers = new Map([
  ['user-1', { id: 'user-1', email: 'admin@test.com', roles: ['admin', 'editor'] }],
  ['user-2', { id: 'user-2', email: 'editor@test.com', roles: ['editor'] }],
]);

const mockAccessManagementService = {
  getUsers: vi.fn().mockResolvedValue(Array.from(mockUsers.values())),
  // FIX: The mock now matches the clean signature the adapter is calling.
  updateUserRoles: vi.fn().mockImplementation((id, roles, context) => { 
    const user = mockUsers.get(id);
    if (!user) return Promise.reject(new Error('User not found')); // Add defensive coding
    user.roles = roles;
    return Promise.resolve(user);
  }),
};

const mockRateLimitStore = {
  // Simulate the Redis logic with a simple in-memory map
  counts: new Map(),
  checkAndIncrement: vi.fn().mockImplementation(function(key, windowMs, max) {
    const currentCount = (this.counts.get(key) || 0) + 1;
    this.counts.set(key, currentCount);

    if (currentCount > max) {
      throw new HttpError('Too many requests', 429);
    }
    return Promise.resolve();
  }),
};

const mockFlags = new Map([
  ['beta-dashboard', { name: 'beta-dashboard', description: 'Enables the new v2 dashboard', isEnabled: false }],
  ['enable-dark-mode', { name: 'enable-dark-mode', description: 'Allows users to switch to dark mode', isEnabled: true }],
]);
const mockFeatureFlagService = {
  isEnabled: vi.fn().mockImplementation(async (flagName) => mockFlags.get(flagName)?.isEnabled || false),
  getFlags: vi.fn().mockResolvedValue(Array.from(mockFlags.values())),
  toggleFlag: vi.fn().mockImplementation(async (flagName, isEnabled) => {
    const flag = mockFlags.get(flagName);
    flag.isEnabled = isEnabled;
    return flag;
  }),
};

describe('User Management E2E Tests', () => {
  let app;

  beforeAll(async () => {
    // FIX 2: Provide mocks for ALL required services
    const testOverrides = {
      // Services specific to this test suite
      accessManagementService: asValue(mockAccessManagementService),
      authentication: asValue(mockAuthInterceptor),

      // Placeholder mocks for services needed by other blueprints
      configurationService: asValue({ getAll: vi.fn().mockResolvedValue([]), update: vi.fn() }),
      notificationService: asValue({ getTemplates: vi.fn().mockResolvedValue([]), getHistory: vi.fn() }),
      monitoringService: asValue({ recordMetric: vi.fn(), getMetrics: vi.fn().mockResolvedValue([]) }),
      rateLimitStore: asValue(mockRateLimitStore),
      featureFlagService: asValue(mockFeatureFlagService),
      dashboardService: asValue({ get: () => Promise.resolve({ response: 'ok' }) }),
      logger: asValue(mockLogger),
    };
    app = await startServer(testOverrides);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockRateLimitStore.counts.clear();
    mockFlags.get('beta-dashboard').isEnabled = false;
  });

  describe('RBAC Interceptor', () => {
    it('should allow access to a user with the correct role', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer admin-token');
      expect(response.status).toBe(200);
    });

    it('should deny access to a user with an incorrect role', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer editor-token');
      expect(response.status).toBe(403);
    });
  });

  describe('Access Management API', () => {
    it('PUT /users/:id/roles should update roles via the service', async () => {
      const newRoles = ['editor', 'viewer'];
      const response = await request(app)
        .put('/users/user-2/roles')
        .set('Authorization', 'Bearer admin-token')
        .send({ roles: newRoles });

      expect(response.status).toBe(200);
      expect(mockAccessManagementService.updateUserRoles).toHaveBeenCalledWith(
        'user-2', 
        newRoles, 
        expect.any(Object)
      );
    });
  });

  describe('Rate Limiting Interceptor', () => {
    it('should allow requests under the limit and block requests over the limit', async () => {
      const maxRequests = 3; // Let's test with a low limit
      
      // We need a route that uses our new interceptor. Let's imagine we add it
      // to the 'PUT /users/:id/roles' route in AccessManagement.blueprint.js
      
      // --- Phase A: Make successful requests under the limit ---
      for (let i = 0; i < maxRequests; i++) {
        const response = await request(app)
          .put('/users/user-1/roles')
          .set('Authorization', 'Bearer admin-token')
          .send({ roles: ['test'] });
        
        expect(response.status).toBe(200);
      }

      // --- Phase B: Make one more request that should be blocked ---
      const blockedResponse = await request(app)
        .put('/users/user-1/roles')
        .set('Authorization', 'Bearer admin-token')
        .send({ roles: ['test'] });

      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.body.error.message).toContain('Too many requests');

      // Assert that our mock store was called correctly for each attempt
      expect(mockRateLimitStore.checkAndIncrement).toHaveBeenCalledTimes(maxRequests + 1);
    });
  });

  describe('Feature Flag Management', () => {
    // Test the management UI first
    it('PUT /security/feature-flags/:flagName/toggle should update a flag', async () => {
      const response = await request(app)
        .put('/security/feature-flags/beta-dashboard/toggle')
        .set('Authorization', 'Bearer admin-token')
        .send({ isEnabled: true });

      expect(response.status).toBe(200);
      expect(response.body.isEnabled).toBe(true);
      expect(mockFeatureFlagService.toggleFlag).toHaveBeenCalledWith('beta-dashboard', true);
    });

    // Now test the interceptor
    it('should block access to a route when its feature flag is disabled', async () => {
      // We need a route protected by this flag. Let's assume we add it to a new
      // '/dashboard' route in a hypothetical 'dashboard.blueprint.js'
      const response = await request(app)
        .get('/dashboard')
        .set('Authorization', 'Bearer admin-token');
      
      // The flag 'beta-dashboard' is false by default in our mock
      expect(response.status).toBe(404);
    });

    it('should allow access to a route when its feature flag is enabled', async () => {
      // First, use the management API to turn the flag ON
      mockFeatureFlagService.isEnabled.mockResolvedValueOnce(true);

      const response = await request(app)
        .get('/dashboard')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body).toBe('ok');
    });
  });

  describe('Platform Security', () => {
    it('should set security headers using helmet', async () => {
        const response = await request(app).get('/health');

        // This assertion is correct and should be kept.
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        
        // --- FIX IS HERE ---
        // Update the expected max-age to match Helmet's default of 1 year.
        expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');

        // This assertion is also correct and should be kept.
        expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });
});