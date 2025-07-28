import axios from 'axios';
import { ProxyError } from './errors.js'; // Import our new custom error

// --- 1. Centralized Axios Instance ---
// This is a best practice for managing API clients.
const apiClient = axios.create({
  timeout: 10000, // Set a default timeout for all requests
});

/**
 * A helper to proxy requests from the gateway to a downstream microservice.
 *
 * @param {object} options
 * @param {string} options.serviceUrl - The base URL of the microservice.
 * @param {import('express').Request} options.req - The original Express request object.
 * @returns {Promise<{status: number, data: any}>} The status and data from the service.
 * @throws {ProxyError} Throws a custom error for all proxy-related failures.
 */
export async function proxyRequest({ serviceUrl, req }) {
  const { method, body, query, headers, originalUrl } = req;
  
  // The full URL to the downstream service endpoint
  const targetUrl = `${serviceUrl}${originalUrl}`;

  // --- 2. Refined Logging ---
  console.log(`[PROXY] --> ${method} ${targetUrl}`);

  // Clean up headers before forwarding
  const forwardedHeaders = _prepareHeaders(headers);

  try {
    const response = await apiClient({
      method,
      url: targetUrl,
      params: query,
      data: body,
      headers: forwardedHeaders,
    });

    console.log(`[PROXY] <-- ${response.status} ${method} ${targetUrl}`);
    return { status: response.status, data: response.data };

  } catch (error) {
    // --- 3. Improved Error Handling with Custom Errors ---
    _handleProxyError(error, targetUrl);
  }
}


// --- Private Helper Functions ---

/**
 * Prepares headers for forwarding by removing gateway-specific headers.
 * @private
 */
function _prepareHeaders(incomingHeaders) {
  // Destructure to remove headers that should not be forwarded
  const { host, connection, 'content-length': contentLength, ...headersToForward } = incomingHeaders;
  
  return {
    ...headersToForward,
    'X-Proxied-By': 'Admin-Panel-Gateway', // Add a custom header to identify the proxy
  };
}

/**
 * Analyzes an Axios error and throws a specific ProxyError.
 * @private
 * @throws {ProxyError}
 */
function _handleProxyError(error, targetUrl) {
  if (error.response) {
    // The downstream service responded with a non-2xx status code
    const { status, data } = error.response;
    const message = data?.message || 'Downstream service returned an error';
    console.error(`[PROXY] <-- ${status} ERROR from ${targetUrl}: ${message}`);
    throw new ProxyError(message, status, data);
  } 
  
  if (error.request) {
    // The request was made, but no response was received (e.g., service is down)
    const message = `The target service is unreachable at ${targetUrl}`;
    console.error(`[PROXY] <-- 503 ERROR: ${message}`);
    throw new ProxyError(message, 503); // 503 Service Unavailable
  }

  // A generic error occurred while setting up the request
  console.error('[PROXY] <-- 500 ERROR: A fatal error occurred during the proxy setup.', error);
  throw new ProxyError('An unexpected error occurred in the gateway.', 500);
}