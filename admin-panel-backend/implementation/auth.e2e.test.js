import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import request from 'supertest';
import { asValue } from 'awilix';
import jwt from 'jsonwebtoken';
import { config } from '#platform/core/config/index.js';
import { startServer } from '#platform/core/Server.js';
import { HttpError } from '#platform/core/errors.js';

// 1. Mock the services that the developer would provide
const mockUser = { id: 'user-123', email: 'test@example.com', roles: ['admin'] };

const mockAuthService = {
  login: vi.fn().mockImplementation(async (email, password) => {
    if (email === 'test@example.com' && password === 'password') {
      // Create a real, valid JWT for the test
      return jwt.sign({ userId: mockUser.id }, config.JWT_SECRET, { expiresIn: '15m' });
    }
    throw new HttpError('Invalid credentials', 401);
  }),
};

const mockAccessManagementService = {
  getUserWithRoles: vi.fn().mockImplementation(async (userId) => {
    if (userId === mockUser.id) {
      return mockUser;
    }
    return null;
  }),
  // Add placeholder methods for other tests that might need this service
  getUsers: vi.fn(),
  updateUserRoles: vi.fn(),
};

describe('Authentication E2E Flow', () => {
  let app;
  let authToken = '';

  beforeAll(async () => {
    const testOverrides = {
      authService: asValue(mockAuthService),
      accessManagementService: asValue(mockAccessManagementService),
      // We still need a placeholder for rbac for other routes
      rbac: asValue({ preHandle: () => Promise.resolve() }),
    };
    app = await startServer(testOverrides);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should deny access to a protected route without a token', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Authentication token is required.');
  });
  
  it('should deny access with a malformed token', async () => {
    const response = await request(app).get('/users').set('Authorization', 'Bearer 12345');
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Invalid authentication token.');
  });

  it('should successfully log in and receive a JWT', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.token.length).toBeGreaterThan(50);
    authToken = response.body.token; // Save token for the next test
  });

  it('should allow access to a protected route with a valid token', async () => {
    // This test depends on the previous one to get the token
    expect(authToken).not.toBe('');
    
    // We need to provide a mock for the '/users' route's dependencies
    mockAccessManagementService.getUsers.mockResolvedValue([mockUser]);

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(mockAccessManagementService.getUserWithRoles).toHaveBeenCalledWith(mockUser.id);
  });
});