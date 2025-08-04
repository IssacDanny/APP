import { asValue } from 'awilix';
import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { startServer } from '#platform/core/Server.js';

describe('End-to-End Tests', () => {
  let app;
  const mockAuditLogService = {
    log: vi.fn(),
  };

  beforeAll(async () => {
    const testOverrides = {
      auditLogService: asValue(mockAuditLogService),
    };
    app = await startServer(testOverrides);
  }, 30000);

  afterEach(() => {
    mockAuditLogService.log.mockClear();
  });

  describe('Product Blueprint Routes', () => {
    it('should successfully proxy a request to an external service', async () => {
      const response = await request(app).get('/products/external/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
    });

    it('should successfully call a custom service and trigger postHandle interceptors', async () => {
      const response = await request(app)
        .get('/products/reports/inventory')
        .set('Authorization', 'Bearer admin-user');

      // Assert the main response is correct
      expect(response.status).toBe(200);
      expect(response.body.generatedBy).toBe('user-admin-user@example.com');

      // Allow a brief moment for the on-finished hook to fire asynchronously
      await new Promise(resolve => setTimeout(resolve, 50));

      // Assert that the postHandle logic (auditing) was triggered
      expect(mockAuditLogService.log).toHaveBeenCalledTimes(1);
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        'User user-admin-user@example.com generated the inventory report.',
  undefined
      );
    });

    it('should fail a custom service method call without an auth token and return a 401', async () => {
      const response = await request(app).get('/products/reports/inventory');
      expect(response.status).toBe(401);
      expect(response.body.error.type).toBe('HttpError');
    });
  });

  describe('Platform Core Routes', () => {
    it('should return 200 for the /health check endpoint', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });
});