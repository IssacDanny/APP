import jwt from 'jsonwebtoken';
import { HttpError } from '../../core/errors.js';
import { config } from '../../core/config/index.js';

/**
 * A production-ready interceptor that validates a JWT Bearer token.
 * It verifies the token and fetches the fresh user profile and roles.
 */
export default class AuthenticationInterceptor {
  constructor({ accessManagementService }) {
    if (!accessManagementService) {
      throw new Error("AuthenticationInterceptor requires an 'accessManagementService'.");
    }
    this.service = accessManagementService;
  }

  async preHandle(context) {
    const { req } = context;
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError('Authentication token is required.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      // 1. Verify the token's signature and expiration
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      if (typeof decoded === 'string' || !decoded.userId) {
        throw new Error('Invalid token payload');
      }

      // 2. Fetch the FRESH user data and roles from the service.
      // This is crucial to ensure the user still exists and their roles are up-to-date.
      const user = await this.service.getUserWithRoles(decoded.userId);

      if (!user) {
        throw new HttpError('User not found.', 401);
      }

      // 3. Attach the fresh, trusted user object to the context.
      context.user = user;

    } catch (error) {
      // Handle specific JWT errors with a clear message
      if (error.name === 'TokenExpiredError') {
        throw new HttpError('Your session has expired. Please log in again.', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new HttpError('Invalid authentication token.', 401);
      }
      // Re-throw other unexpected errors
      throw error;
    }
  }
}