const UmsApiService = require('./UmsApiService');
const ProjectMasterApiService = require('./ProjectMasterApiService');

const adapters = {
  users: UmsApiService,
  projects: ProjectMasterApiService,
  // To add a new service, you only need to add it here
};

function getAdapter(entity) {
  const adapter = adapters[entity];
  if (!adapter) {
    throw new Error(`Adapter for entity "${entity}" not found.`);
  }
  return adapter;
}

module.exports = { getAdapter };