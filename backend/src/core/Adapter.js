import { AdapterError } from './utils/errors.js';

/**
 * Validates the adapter configuration object.
 * @private
 * @param {object} config - The configuration object to validate.
 */
function _validateConfig(config) {
  const { resourcePrefix, schema, getRoutes } = config;

  if (!resourcePrefix || typeof resourcePrefix !== 'string' || !resourcePrefix.startsWith('/')) {
    throw new AdapterError(`Adapter config must have a valid 'resourcePrefix' (string starting with '/').`);
  }
  if (!schema) {
    throw new AdapterError(`Adapter config must have a 'schema' property.`);
  }
  if (!getRoutes || typeof getRoutes !== 'function') {
    throw new AdapterError(`Adapter config must have a 'getRoutes' function.`);
  }
}

/**
 * Creates a new, validated, and immutable service adapter object.
 * This factory function is the foolproof way to define an adapter.
 *
 * @param {object} config - The configuration object for the adapter.
 * @param {string} config.resourcePrefix - The base URL path (e.g., '/products').
 * @param {object} config.schema - The UI schema for this resource.
 * @param {Function} config.getRoutes - A function that returns an Express router.
 * @param {Array<Function>} [config.middleware] - Optional array of middleware.
 * @returns {Readonly<{resourcePrefix: string, schema: object, getRoutes: Function, middleware: Array<Function>}>} A frozen adapter object.
 */
export function createAdapter(config) {
  // 1. Validate the configuration immediately.
  _validateConfig(config);

  // 2. Create the final adapter object with defaults.
  const adapter = {
    resourcePrefix: config.resourcePrefix,
    schema: config.schema,
    getRoutes: config.getRoutes,
    middleware: config.middleware || [],
  };

  // 3. Freeze the object to make it immutable and return it.
  return Object.freeze(adapter);
}