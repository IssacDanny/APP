import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { asValue } from 'awilix';
import { startServer } from '#platform/core/Server.js';

// 1. Define the Mock Service that fulfills the contract
const mockDb = new Map([
  ['maintenanceMode', { key: 'maintenanceMode', value: 'false', description: 'Enable/disable site maintenance', lastModified: new Date().toISOString() }],
  ['welcomeMessage', { key: 'welcomeMessage', value: 'Hello, World!', description: 'The message on the login screen', lastModified: new Date().toISOString() }],
]);

const mockConfigurationService = {
  getAll: vi.fn().mockResolvedValue(Array.from(mockDb.values())),
  update: vi.fn().mockImplementation((key, value) => {
    const updated = { ...mockDb.get(key), value, lastModified: new Date().toISOString() };
    mockDb.set(key, updated);
    return Promise.resolve(updated);
  }),
};

describe('System Management E2E Tests', () => {
  let app;

  beforeAll(async () => {
    // 2. Inject our mock service when the server starts
    const testOverrides = {
      configurationService: asValue(mockConfigurationService),
      // We also mock the RBAC interceptor to always allow access for this test
      rbac: asValue({ preHandle: () => Promise.resolve() }),
    };
    app = await startServer(testOverrides);
  }, 30000);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration Management Module', () => {
    it('GET /system/configuration should retrieve all variables via the service', async () => {
      // Act: Send request to the blueprint's route
      const response = await request(app)
        .get('/system/configuration')
        .set('Authorization', 'Bearer admin'); // Pass auth to satisfy interceptors

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].key).toBe('maintenanceMode');
      // Check that our mock service was called by the generic adapter
      expect(mockConfigurationService.getAll).toHaveBeenCalledTimes(1);
    });

    it('PUT /system/configuration should update a variable via the service', async () => {
      // Act
      const response = await request(app)
        .put('/system/configuration')
        .set('Authorization', 'Bearer admin')
        .send({ key: 'welcomeMessage', value: 'Hello, Universe!' });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body.value).toBe('Hello, Universe!');
      // Check that the generic adapter called our mock service's update method
      expect(mockConfigurationService.update).toHaveBeenCalledTimes(1);
      expect(mockConfigurationService.update).toHaveBeenCalledWith('welcomeMessage', 'Hello, Universe!');
    });
  });
});