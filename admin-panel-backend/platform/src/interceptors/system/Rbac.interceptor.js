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

    // 1. Ensure the interceptor is configured correctly in the blueprint.
    if (!allowedRoles || !Array.isArray(allowedRoles)) {
      console.error(`[RBAC] Misconfiguration: 'allowedRoles' array option is missing for this route.`);
      // This is a server configuration error, so we throw a 500.
      throw new Error('Access control for this route is not configured correctly.');
    }

    // 2. Ensure the Authentication interceptor has run and identified a user.
    if (!context.user) {
      // This means the user is not even logged in. Let the service handle the 401.
      // Or, more strictly, we could throw a 401 here. For now, we'll assume auth is handled.
      // We are checking for permissions, not authentication.
      throw new HttpError('You do not have permission to perform this action. Authentication required.', 403);
    }
    
    const userRoles = context.user.roles || [];

    // 3. Perform the actual role check.
    const hasPermission = userRoles.some(userRole => allowedRoles.includes(userRole));

    if (!hasPermission) {
      // 403 Forbidden: The user is authenticated, but their roles are not sufficient.
      throw new HttpError('You do not have permission to perform this action.', 403);
    }
    
    // If the check passes, do nothing and let the request continue.
  }
}