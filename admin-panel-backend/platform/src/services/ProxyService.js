import fetch from 'node-fetch';
import { ProxyError } from '../core/errors.js';
export const registration = { type: 'class' }; 
/**
 * A service responsible for forwarding requests to downstream services.
 */
export default class ProxyService {
  constructor({ logger }) {
    this.logger = logger;
  }

  /**
   * Forwards an incoming Express request to a target service URL.
   *
   * @param {object} options
   * @param {import('express').Request} options.req - The original Express request object.
   * @param {string} options.targetServiceUrl - The base URL of the target service.
   * @returns {Promise<{status: number, data: any}>} The status and JSON data from the target service.
   * @throws {ProxyError} If the request fails at any stage.
   */
  async forwardRequest({ req, targetServiceUrl, downstreamPath }) { // <-- FIX 1: Add downstreamPath parameter
    const { method, body, headers } = req;
    // Construct the URL correctly now using the provided path
    const targetUrl = `${targetServiceUrl}${downstreamPath}`; // <-- FIX 2: Use downstreamPath, NOT originalUrl

    this.logger.info(`[PROXY-DEBUG] Attempting to fetch final URL: ${targetUrl}`);
    this.logger.info(`[PROXY] --> ${method} ${targetUrl}`);

    const headersToForward = this._prepareHeaders(headers);

    try {
      const response = await fetch(targetUrl, {
        method,
        headers: headersToForward,
        ...(this._hasBody(method) && { body: JSON.stringify(body) }),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message || `Downstream service returned status ${response.status}`;
        throw new ProxyError(errorMessage, response.status, responseData);
      }

      this.logger.info(`[PROXY] <-- ${response.status} ${method} ${targetUrl}`);
      return { status: response.status, data: responseData };

    } catch (error) {
      if (error instanceof ProxyError) {
        throw error;
      }
      this.logger.error(`[PROXY] <-- FAILED ${method} ${targetUrl}`, error);
      throw new ProxyError(`The target service is unreachable at ${targetServiceUrl}`, 503);
    }
  }

  /**
   * @private
   * Cleans up headers before forwarding.
   */
  _prepareHeaders(incomingHeaders) {
    // Create a copy to avoid modifying the original request object.
    const headers = { ...incomingHeaders };

    // Remove headers that are specific to the incoming request's connection.
    delete headers['host'];
    delete headers['connection'];
    delete headers['content-length']; // `fetch` will set this correctly.

    return {
      ...headers,
      'content-type': 'application/json', // Assuming our gateway standardizes on JSON
      'x-forwarded-by': 'saas-admin-panel-gateway',
    };
  }

  /**
   * @private
   * Checks if the HTTP method typically includes a body.
   */
  _hasBody(method) {
    return ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase());
  }
}