import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { asValue } from 'awilix';
import { startServer } from '#platform/core/Server.js';
import { mockAuthInterceptor } from './test_mocks/MockAuthInterceptor.js';
// --- DEFINE ALL MOCKS AT THE TOP ---

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

const mockNotificationService = {
  getTemplates: vi.fn().mockResolvedValue([
    { id: 'welcome-email', name: 'Welcome Email', type: 'email' },
  ]),
  getHistory: vi.fn().mockResolvedValue([
    { id: 1, timestamp: new Date().toISOString(), recipient: 'test@example.com', type: 'email', status: 'SENT' },
  ]),
  send: vi.fn().mockResolvedValue({ success: true }),
};

const recordedMetrics = [];
const mockMonitoringService = {
  recordMetric: vi.fn().mockImplementation(metric => {
    recordedMetrics.push(metric);
    return Promise.resolve();
  }),
  getMetrics: vi.fn().mockImplementation(() => {
    return Promise.resolve(recordedMetrics);
  }),
};


// --- THE SINGLE, UNIFIED TEST SUITE ---
describe('System Management E2E Tests', () => {
  let app;

  beforeAll(async () => {
    const testOverrides = {
      // Services for this suite
      configurationService: asValue(mockConfigurationService),
      notificationService: asValue(mockNotificationService),
      monitoringService: asValue(mockMonitoringService),
      
      // FIX 2: Use the shared, consistent mock for authentication
      authentication: asValue(mockAuthInterceptor),
      
      // Placeholder mock for services needed by other blueprints
      accessManagementService: asValue({ getUsers: vi.fn().mockResolvedValue([]), updateUserRoles: vi.fn() }),
      rbac: asValue({ preHandle: () => Promise.resolve() }), // Keep this simple rbac mock for now
    };
    app = await startServer(testOverrides);
  }, 30000);

  afterEach(() => {
    vi.clearAllMocks();
    recordedMetrics.length = 0;
    mockDb.set('welcomeMessage', { key: 'welcomeMessage', value: 'Hello, World!' });
  });

  // --- Test Suite for Configuration ---
  describe('Configuration Management Module', () => {
    it('GET /system/configuration should retrieve all variables via the service', async () => {
      const response = await request(app)
        .get('/system/configuration')
        .set('Authorization', 'Bearer admin-token'); // Use token from mock
      expect(response.status).toBe(200);
    });

    it('PUT /system/configuration should update a variable via the service', async () => {
      const response = await request(app)
        .put('/system/configuration')
        .set('Authorization', 'Bearer admin-token') // Use token from mock
        .send({ key: 'welcomeMessage', value: 'Hello, Universe!' }); // <-- REMOVE THE LEADING '.' HERE
      expect(response.status).toBe(200);
    });
  });

  // --- Test Suite for Notifications ---
  describe('Notification Management Module', () => {
    it('GET /system/notifications/templates should retrieve all templates', async () => {
      const response = await request(app)
        .get('/system/notifications/templates')
        .set('Authorization', 'Bearer admin');
      expect(response.status).toBe(200);
      expect(response.body[0].id).toBe('welcome-email');
      expect(mockNotificationService.getTemplates).toHaveBeenCalledTimes(1);
    });
  });
  
  // --- Test Suite for Monitoring ---
  describe('Monitoring Management Module', () => {
    it('should record a metric and then retrieve it', async () => {
      // Phase A: Trigger the interceptor by calling a monitored route
      await request(app).get('/system/configuration').set('Authorization', 'Bearer admin');
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(mockMonitoringService.recordMetric).toHaveBeenCalledTimes(1);

      // Phase B: Fetch the metrics and verify the recorded one is present
      const metricsResponse = await request(app).get('/system/monitoring/metrics').set('Authorization', 'Bearer admin');
      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body).toHaveLength(1);
      expect(metricsResponse.body[0].path).toBe('/system/configuration');
      expect(mockMonitoringService.getMetrics).toHaveBeenCalledTimes(1);
    });
  });
});