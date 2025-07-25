import { serviceManifest, projectData, userData } from './manifests/project'; // We'll add userData soon

const MOCK_DB = {
  projects: projectData,
  users: userData,
};

// This simulates a network call
export async function mockApi(resourceName: string, actionName: string, params: any = {}) {
  console.log(`📞 Mock API Call:`, { resourceName, actionName, params });
  await new Promise(res => setTimeout(res, 300)); // Simulate network latency

  const resource = serviceManifest[resourceName];
  if (!resource) throw new Error(`Resource "${resourceName}" not found.`);
  
  const action = resource.actions[actionName];
  if (!action) throw new Error(`Action "${actionName}" not found in resource "${resourceName}".`);

  // In a real app, you'd use action.api.method and action.api.path here
  switch (actionName) {
    case 'retrieve':
      return { data: MOCK_DB[resourceName] };
    case 'retrieveByID':
      const item = MOCK_DB[resourceName].find(d => d.id === params.id);
      if (!item) throw new Error(`Item with ID ${params.id} not found in ${resourceName}.`);
      return { data: item };
    default:
      throw new Error(`Mock API handler for action "${actionName}" not implemented.`);
  }
}