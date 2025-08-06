import { createClient } from 'redis';
import { HttpError } from '../core/errors.js';
import { config } from '../core/config/index.js';

/**
 * A service that uses Redis to provide rate-limiting functionality.
 * This is designed to be injected into the RateLimitingInterceptor.
 */
export default class RateLimitStore {
  constructor() {
    if (!config.REDIS_URL) {
      // Fail gracefully if Redis is not configured, as it's an optional service.
      console.warn('[RateLimitStore] REDIS_URL not configured. Rate limiting will be disabled.');
      this.redisClient = null;
      return;
    }

    this.redisClient = createClient({
      url: config.REDIS_URL,
    });

    this.redisClient.on('error', (err) => console.error('[Redis] Client Error', err));
    // We don't await the connection here to avoid blocking server startup.
    // The client will queue commands until the connection is ready.
    this.redisClient.connect();
  }

  /**
   * Increments the request count for a given key and checks if it exceeds the limit.
   * @param {string} key - The unique key to track (e.g., based on IP or user ID).
   * @param {number} windowMs - The duration of the window in milliseconds.
   * @param {number} max - The maximum number of requests allowed in the window.
   * @throws {HttpError} If the rate limit is exceeded.
   */
  async checkAndIncrement(key, windowMs, max) {
    if (!this.redisClient) {
      return;
    }
    
    const windowSec = Math.ceil(windowMs / 1000);

    try {
      const multi = this.redisClient.multi();
      multi.incr(key); // Increment the count
      multi.expire(key, windowSec, 'NX'); // Set expiry only if the key is new

      const [_, currentCount] = await multi.exec();

      if (currentCount > max) {
        throw new HttpError('Too many requests, please try again later.', 429);
      }
    } catch (err) {
      // If Redis is down, we should not block the request. We fail open.
      if (!(err instanceof HttpError)) {
          console.error('[RateLimit] Redis command failed. Failing open.', err);
      } else {
          // Re-throw the HttpError if the limit was exceeded
          throw err;
      }
    }
  }

  /**
   * Gracefully disconnects the Redis client.
   * This will be called by the server during shutdown.
   */
  async close() {
    if (this.redisClient && this.redisClient.isOpen) {
      try {
        await this.redisClient.quit();
        console.log('[RateLimitStore] Redis client disconnected gracefully.');
      } catch (err) {
        console.error('[RateLimitStore] Error during Redis disconnection:', err);
      }
    }
  }

  // We could add getStats() or manageBlocklist() methods here later for the UI.
}