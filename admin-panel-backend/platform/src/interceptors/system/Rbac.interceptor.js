import { HttpError } from '../../core/errors.js';

/**
 * An interceptor that performs Role-Based Access Control (RBAC).
 * It checks if a user's roles overlap with the roles allowed for a specific route.
 */
export default class RbacInterceptor {
  /**
   * This pre-handle hook enforces the access control check.
   * @param {object} context - The request context, must contain `context.user`.
   * @param {object} options - Options passed from the blueprint, must contain `options.allowedRoles`.
   */
  async preHandle(context, options) {
    const { allowedRoles } = options;
    const userRoles = context.user?.roles || [];

    const hasPermission = userRoles.some(userRole => allowedRoles.includes(userRole));
    if (!hasPermission) {
      throw new HttpError('You do not have permission to perform this action.', 403);
    }
  }
}