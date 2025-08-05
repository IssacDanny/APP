/**
 * A configurable interceptor for enforcing rate limits on API routes.
 */
export default class RateLimitingInterceptor {
  constructor({ rateLimitStore }) {
    if (!rateLimitStore) {
      throw new Error("RateLimitingInterceptor requires a 'rateLimitStore'.");
    }
    this.store = rateLimitStore;
  }

  /**
   * Runs before the main handler to check the rate limit.
   * @param {object} context
   * @param {object} options - Config from the blueprint.
   */
  async preHandle(context, options) {
    const { req } = context;
    const { 
      windowMs = 60 * 1000, // Default: 1 minute
      max = 5,             // Default: 5 requests
      keyGenerator,        // A function to generate the tracking key
    } = options;

    if (!keyGenerator) {
      throw new Error("RateLimitingInterceptor requires a 'keyGenerator' function in its options.");
    }
    
    // Generate the unique key for this request
    const key = `rate-limit:${keyGenerator(req, context)}`;

    // Delegate the core logic to our Redis-backed service
    await this.store.checkAndIncrement(key, windowMs, max);
  }
}