import { usersDb } from '../data/database.js';
import { HttpError } from '#platform/core/errors.js';

/**
 * The concrete implementation of the AccessManagementService.
 * It fulfills the contract required by the platform's AccessAdapter
 * and AuthenticationInterceptor by interacting with the in-memory usersDb.
 */
export default class AccessManagementService {
  constructor() {
    // This service might depend on other services in the future,
    // e.g., a service to look up available roles.
    this.db = usersDb;
  }

  /**
   * Retrieves a list of all users for the management UI.
   * This implementation omits sensitive data like the password hash.
   * @param {object} context - The request context (unused in this simple implementation).
   * @returns {Promise<Array<object>>}
   */
  async getUsers(context) {
    const allUsers = Array.from(this.db.values());
    // Never send sensitive data like password hashes to the client.
    return allUsers.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  /**
   * Updates the roles for a specific user.
   * @param {string} userId - The ID of the user to update.
   * @param {string[]} roles - The new array of roles for the user.
   * @param {object} context - The request context.
   * @returns {Promise<object>} The updated, safe user object.
   * @throws {HttpError} If the user is not found.
   */
  async updateUserRoles(userId, roles, context) {
    if (!this.db.has(userId)) {
      throw new HttpError(`User with ID '${userId}' not found.`, 404);
    }

    const user = this.db.get(userId);
    user.roles = roles; // Update the roles in our in-memory "database"

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Fetches a single, complete user profile, including roles.
   * This is used by the AuthenticationInterceptor to get fresh data on every request.
   * @param {string} userId - The ID of the user to fetch.
   * @returns {Promise<object | null>} The full user object or null if not found.
   */
  async getUserWithRoles(userId) {
    if (!this.db.has(userId)) {
      return null;
    }
    const user = this.db.get(userId);
    // Return the safe user object (without the password hash).
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}