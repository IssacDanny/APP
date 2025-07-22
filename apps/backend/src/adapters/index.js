// 1. Import the adapter INSTANCES (the `new ...()` exports)
const UmsApiService = require('./UmsApiService');
const ProjectMasterApiService = require('./ProjectMasterApiService');

// 2. Create the registry object (the map)
// The keys here MUST EXACTLY MATCH what you use in your API URLs.
const adapters = {
  // The URL parameter "projectmaster" maps to the ProjectMasterApiService instance.
  'projectmaster': ProjectMasterApiService,

  // The URL parameter "ums" will map to the UmsApiService instance.
  'ums': UmsApiService,
  
  // To add a new service, you would add a new line here:
  // 'billing': BillingApiService,
};

/**
 * A factory function to retrieve the correct adapter based on an entity name.
 * @param {string} entity The name of the entity from the URL (e.g., 'projectmaster').
 * @returns The corresponding service adapter instance.
 */
function getAdapter(entity) {
  const adapter = adapters[entity];
  if (!adapter) {
    // This is the error you are seeing.
    throw new Error(`Adapter for entity "${entity}" not found.`);
  }
  return adapter;
}

// 3. Export the factory function
module.exports = { getAdapter };