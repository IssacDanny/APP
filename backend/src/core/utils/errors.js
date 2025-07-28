/**
 * A custom error class for adapter-related configuration failures.
 */
export class AdapterError extends Error {
  constructor(message) {
    super(message);
    this.name = "AdapterError";
  }
}

export class ProxyError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code to return.
   * @param {any} [responseData=null] - The original error data from the downstream service.
   */
  constructor(message, statusCode, responseData = null) {
    super(message);
    this.name = "ProxyError";
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}