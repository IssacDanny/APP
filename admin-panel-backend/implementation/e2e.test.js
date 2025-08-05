import { asValue } from 'awilix';
import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { startServer } from '#platform/core/Server.js';

// Mock node-fetch at the top level so it applies to the whole file
vi.mock('node-fetch');
import fetch from 'node-fetch';

// A single, top-level describe block that wraps ALL tests
describe('End-to-End Tests', () => {
  let app;
  const mockAuditLogService = {
    log: vi.fn(),
  };

  // Start the server once before any test in this file runs
  beforeAll(async () => {
    const testOverrides = {
      auditLogService: asValue(mockAuditLogService),
    };
    app = await startServer(testOverrides);
  }, 30000);

  // This runs after each test, ensuring a clean state
  afterEach(() => {
    // This is crucial: it resets fetch, spies, etc.
    vi.clearAllMocks();
  });

  // --- SUITE 1: PRODUCT ROUTES ---
  describe('Product Blueprint Routes', () => {
    it('should successfully proxy a request to an external service', async () => {
      // FIX #1: Arrange a mock for this specific test's fetch call
      const mockApiResponse = { userId: 1, id: 1, title: 'delectus aut autem' };
      const mockFetchResponse = { ok: true, status: 200, json: vi.fn().mockResolvedValue(mockApiResponse) };
      fetch.mockResolvedValue(mockFetchResponse);

      // Act
      const response = await request(app).get('/products/external/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      // Also assert that fetch was called correctly
      expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todos/1', expect.anything());
    });

    it('should successfully call a custom service and trigger postHandle interceptors', async () => {
      // No changes needed here, this test was already correct
      const response = await request(app)
        .get('/products/reports/inventory')
        .set('Authorization', 'Bearer admin-user');

      expect(response.status).toBe(200);
      expect(response.body.generatedBy).toBe('user-admin-user@example.com');

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockAuditLogService.log).toHaveBeenCalledTimes(1);
    });

    it('should fail a custom service method call without an auth token and return a 401', async () => {
      // No changes needed here
      const response = await request(app).get('/products/reports/inventory');
      expect(response.status).toBe(401);
      expect(response.body.error.type).toBe('HttpError');
    });
  });

  // --- SUITE 2: PLATFORM CORE ROUTES ---
  describe('Platform Core Routes', () => {
    it('should return 200 for the /health check endpoint', async () => {
      // No changes needed here
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });
  });

  // --- SUITE 3: TRANSFORMATION LAYER ---
  // FIX #2: This entire block is now nested INSIDE the main describe block
  describe('Data Transformation Layer', () => {
    it('should transform request and response for a proxied route', async () => {
      // Arrange
      const mockApiResponse = { prod_id: 'xyz-789', prod_name: 'A Messy Product', inventory: { on_hand: 150 } };
      const mockFetchResponse = { ok: true, status: 201, json: vi.fn().mockResolvedValue(mockApiResponse) };
      fetch.mockResolvedValue(mockFetchResponse);

      const cleanRequestBody = { name: 'A Clean Product', stock: 150 };

      // Act
      const response = await request(app) // `app` is now accessible
        .post('/products')
        .send(cleanRequestBody);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 'xyz-789', name: 'A Messy Product', stock: 150 });
    });
  });
});