import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { startServer } from '#platform/core/Server.js';

describe('End-to-End Tests', () => {
  let app;

  beforeAll(async () => {
    // We don't need overrides anymore as there is no post-handle to test.
    app = await startServer();
  }, 30000);

  describe('Product Blueprint Routes', () => {
    it('should successfully proxy a request to an external service', async () => {
      const response = await request(app).get('/products/external/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
    });

    // This test is now simpler. We just check if it succeeds.
    it('should successfully call a custom service method with an interceptor', async () => {
      const response = await request(app)
        .get('/products/reports/inventory')
        .set('Authorization', 'Bearer admin-user');

      expect(response.status).toBe(200);
      expect(response.body.generatedBy).toBe('user-admin-user@example.com');
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