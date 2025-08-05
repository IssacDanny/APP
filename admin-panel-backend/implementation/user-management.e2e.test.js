import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { asValue } from 'awilix';
import { startServer } from '#platform/core/Server.js';
// FIX 1: Import the shared mock
import { mockAuthInterceptor } from './test_mocks/MockAuthInterceptor.js';

const mockUsers = new Map([
  ['user-1', { id: 'user-1', email: 'admin@test.com', roles: ['admin', 'editor'] }],
  ['user-2', { id: 'user-2', email: 'editor@test.com', roles: ['editor'] }],
]);

const mockAccessManagementService = {
  getUsers: vi.fn().mockImplementation((context) => Promise.resolve(Array.from(mockUsers.values()))),
  updateUserRoles: vi.fn().mockImplementation((id, roles, context) => {
    const user = mockUsers.get(id);
    user.roles = roles;
    return Promise.resolve(user);
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
    };
    app = await startServer(testOverrides);
  }, 30000);

  afterEach(() => {
    vi.clearAllMocks();
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
});