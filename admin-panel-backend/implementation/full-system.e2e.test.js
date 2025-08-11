import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { startServer } from '#platform/core/Server.js';
import { config } from '#platform/core/config/index.js';

// We import the real, in-memory database to assert changes
import { usersDb, configDb, flagsDb } from './src/data/database.js';

describe('Full System E2E Tests (Backend-Only)', () => {
  let app;
  let adminToken; // To store a valid token for an admin user

  // --- 1. Start the server ONCE without any mocks ---
  beforeAll(async () => {
    // No 'testOverrides' are passed. The server will use the real service implementations.
    app = await startServer();
    
    // Generate a token for our admin user from the database for tests
    const adminUser = usersDb.get('user-1');
    adminToken = jwt.sign({ userId: adminUser.id }, config.JWT_SECRET, { expiresIn: '15m' });
  });

  // --- 2. Reset database state before each test to ensure isolation ---
  beforeEach(() => {
    // Reset any data that might be modified by tests
    configDb.get('welcomeMessage').value = 'Welcome to the Admin Panel!';
    usersDb.get('user-2').roles = ['editor'];
  });

  // --- 3. Test Suites for Each Module ---

  describe('Authentication and RBAC', () => {
    it('should deny access to a protected route without a token', async () => {
      const response = await request(app).get('/users');
      expect(response.status).toBe(401);
    });

    it('should deny access to an admin-only route for a non-admin user', async () => {
      // Generate a token for the editor user
      const editorUser = usersDb.get('user-2');
      const editorToken = jwt.sign({ userId: editorUser.id }, config.JWT_SECRET);
      
      const response = await request(app)
        .get('/users') // This route requires 'admin' role
        .set('Authorization', `Bearer ${editorToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Configuration Management', () => {
    it('GET /system/configuration should return all config variables', async () => {
      const response = await request(app)
        .get('/system/configuration')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[1].key).toBe('welcomeMessage');
    });

    it('PUT /system/configuration should update a variable', async () => {
      const response = await request(app)
        .put('/system/configuration')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: 'welcomeMessage', value: 'New Message!' });

      expect(response.status).toBe(200);
      expect(response.body.value).toBe('New Message!');

      // Assert that the in-memory database was actually changed
      expect(configDb.get('welcomeMessage').value).toBe('New Message!');
    });
  });
  
  describe('Access Management', () => {
    it('GET /users should return a list of users', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      // Verify that the passwordHash is not included in the response
      expect(response.body[0].passwordHash).toBeUndefined();
    });

    it('PUT /users/:id/roles should update a user\'s roles', async () => {
      const response = await request(app)
        .put('/users/user-2/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roles: ['editor', 'viewer'] });
        
      expect(response.status).toBe(200);
      expect(response.body.roles).toEqual(['editor', 'viewer']);

      // Assert that the in-memory database was changed
      expect(usersDb.get('user-2').roles).toEqual(['editor', 'viewer']);
    });
  });

  // Add describe blocks for Feature Flags, Rate Limiting, etc. following the same pattern...

});