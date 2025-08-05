import { HttpError } from '../../core/errors.js';

/**
 * An interceptor that guards a route based on the state of a feature flag.
 */
export default class FeatureFlagInterceptor {
  constructor({ featureFlagService }) {
    if (!featureFlagService) {
      throw new Error("FeatureFlagInterceptor requires a 'featureFlagService'.");
    }
    this.service = featureFlagService;
  }

  /**
   * Runs before the main handler to check the flag's state.
   * @param {object} context
   * @param {object} options - Config from the blueprint, requires 'flagName'.
   */
  async preHandle(context, options) {
    const { flagName } = options;
    if (!flagName) {
      throw new Error("FeatureFlagInterceptor requires a 'flagName' in its options.");
    }

    // Delegate the check to the service, passing the user for context-aware flags.
    const isEnabled = await this.service.isEnabled(flagName, context.user);

    if (!isEnabled) {
      // If the flag is off, we throw a 404 to make the route appear non-existent.
      // This is generally better for security than a 403 Forbidden.
      throw new HttpError('The requested feature is not available.', 404);
    }
  }
}