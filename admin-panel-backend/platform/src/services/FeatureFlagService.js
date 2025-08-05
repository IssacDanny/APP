/**
 * A placeholder service for managing feature flags.
 * The developer provides their own concrete implementation of this.
 */
export default class FeatureFlagService {
  /**
   * Checks if a feature flag is enabled for a given user context.
   * @param {string} flagName - The name of the flag to check.
   * @param {object | null} user - The authenticated user object, for user-specific flags.
   * @returns {Promise<boolean>}
   */
  async isEnabled(flagName, user) {
    // This is where the developer's logic would go (e.g., check database).
    // For platform-level testing, we assume false unless mocked.
    console.warn(`[FeatureFlagService] 'isEnabled' called for '${flagName}', but no real implementation is provided. Defaulting to false.`);
    return false;
  }

  /**
   * Retrieves all feature flags for the management UI.
   * @returns {Promise<Array<{name: string, description: string, isEnabled: boolean}>>}
   */
  async getFlags() {
    return [];
  }

  /**
   * Toggles the state of a feature flag.
   * @param {string} flagName
   * @param {boolean} isEnabled
   * @returns {Promise<object>} The updated flag object.
   */
  async toggleFlag(flagName, isEnabled) {
    return {};
  }
}