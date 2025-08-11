import { flagsDb } from '../data/database.js';
import { HttpError } from '#platform/core/errors.js';

/**
 * The concrete implementation of the FeatureFlagService.
 * It manages feature flag state using an in-memory database.
 */
export default class FeatureFlagService {
  constructor() {
    this.db = flagsDb;
  }

  /**
   * Retrieves all feature flags for the management UI.
   * @returns {Promise<Array<object>>}
   */
  async getFlags() {
    return Array.from(this.db.values());
  }

  /**
   * Toggles the enabled state of a feature flag.
   * @param {string} flagName - The name of the flag to toggle.
   * @param {boolean} isEnabled - The new state for the flag.
   * @returns {Promise<object>} The updated flag object.
   * @throws {HttpError} If the flag is not found.
   */
  async toggleFlag(flagName, isEnabled) {
    if (!this.db.has(flagName)) {
      throw new HttpError(`Feature flag '${flagName}' not found.`, 404);
    }

    const flag = this.db.get(flagName);
    flag.isEnabled = isEnabled; // Update the state

    return flag;
  }

  /**
   * Checks if a feature flag is enabled.
   * This simple implementation does not use the user context, but a real-world
   * implementation could use it for user- or tenant-specific flags.
   * @param {string} flagName - The name of the flag to check.
   * @param {object | null} user - The authenticated user object.
   * @returns {Promise<boolean>}
   */
  async isEnabled(flagName, user) {
    if (!this.db.has(flagName)) {
      // If a flag is requested in code but not defined in the DB,
      // it should be considered safely "off".
      return false;
    }
    return this.db.get(flagName).isEnabled;
  }
}