const axios = require('axios');
const { validate } = require('../services/schemaValidator');

class BaseApiService {
  constructor(baseURL) {
    if (!baseURL) throw new Error('A baseURL must be provided.');
    this.api = axios.create({ baseURL });
    
    // This will hold our validated, registered actions
    this._actions = {};

    this._validateAndRegisterManifest();
  }

  /**
   * Reads the static 'resources' manifest, VALIDATES it,
   * and then populates the internal _actions map.
   * @private
   */
  _validateAndRegisterManifest() {
    const manifest = this.constructor.resources;
    if (!manifest) {
        console.warn(`Adapter for ${this.api.defaults.baseURL} has no static resources manifest.`);
        return;
    }

    // --- Step 1: ONE VALIDATION TO RULE THEM ALL ---
    const { valid, errors } = validate('manifest', manifest);

    if (!valid) {
      const errorMsg = `FATAL: Invalid resource manifest for adapter extending BaseApiService.`;
      console.error('─'.repeat(80));
      console.error(errorMsg);
      console.error('Validation Errors:', JSON.stringify(errors, null, 2));
      console.error('─'.repeat(80));
      throw new Error('Application startup failed due to invalid resource manifest.');
    }

    console.log(`✅ Resource manifest for ${this.constructor.name} validated successfully.`);

    // --- Step 2: POPULATE THE ACTIONS (The Missing Part) ---
    // Now that we know it's valid, we can safely register everything.
    for (const resourceName in manifest) {
      this._actions[resourceName] = {};
      const resourceConfig = manifest[resourceName];

      if (resourceConfig.actions) {
        for (const actionName in resourceConfig.actions) {
          const actionConfig = resourceConfig.actions[actionName];
          // Store the validated config for later use
          this._actions[resourceName][actionName] = {
            api: actionConfig.api,
            schema: actionConfig.schema,
          };
        }
      }
    }
  }

  /**
   * Executes a registered action.
   * @param {string} resource The name of the resource (e.g., 'projects').
   * @param {string} action The name of the action (e.g., 'create').
   * @param {object} args For GET, the query params. For POST, the request body.
   */
  async executeAction(resource, action, args) {
    const actionConfig = this._actions?.[resource]?.[action];
    if (!actionConfig) {
      throw new Error(`Action '${action}' is not defined for resource '${resource}'.`);
    }

    const { method, path } = actionConfig.api;
    // A simple templating for IDs in paths, e.g., /projects/{id}
    const finalPath = path.replace(/\{id\}/, args?.id || '');

    console.log(`Executing action '${action}': ${method.toUpperCase()} to ${finalPath}`);
    
    try {
        if (method === 'get' || method === 'delete') {
            return (await this.api[method](finalPath, { params: args })).data;
        } else {
            return (await this.api[method](finalPath, args)).data;
        }
    } catch (error) {
        console.error(`API Error on ${method.toUpperCase()} ${finalPath}:`, error.message);
        throw new Error(`The downstream service request failed for action '${action}'.`);
    }
  }

  /**
   * Retrieves the pre-validated schema for a given action.
   * @param {string} resource The name of the resource.
   * @param {string} action The name of the action.
   */
  async getSchemaForAction(resource, action) {
    const schema = this._actions?.[resource]?.[action]?.schema;
    if (!schema) {
      throw new Error(`Schema for action '${action}' on resource '${resource}' not found.`);
    }
    return schema;
  }
}

module.exports = BaseApiService;