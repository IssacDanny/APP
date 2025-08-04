/**
 * Custom error for failures during the proxying process.
 */
export class ProxyError extends Error {
  /**
   * @param {string} message The error message.
   * @param {number} statusCode The HTTP status code to return from the gateway.
   * @param {any} [downstreamError=null] The original error data from the downstream service.
   */
  constructor(message, statusCode, downstreamError = null) {
    super(message);
    this.name = 'ProxyError';
    this.statusCode = statusCode;
    this.downstreamError = downstreamError;
  }
}

/**
 * A generic error for HTTP-related failures that should be sent to the client.
 */
export class HttpError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code to return.
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}