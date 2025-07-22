const axios = require('axios');

const ADMIN_API_URL = 'http://localhost:8080/api/v1';
const ADMIN_API_KEY = 'my-secret-key';

// Create an API client for our Admin Facade
const adminApiClient = axios.create({
  baseURL: ADMIN_API_URL,
  headers: { 'x-api-key': ADMIN_API_KEY },
});

// This simulates the entire process a UI would go through
async function runDemo() {
  console.log('--- DEMO: Managing Projects ---');

  // 1. UI needs to build the "Create Project" form. It asks the Facade for the schema.
  console.log('\n1. Fetching schema for "create project" action...');
  const createSchemaResponse = await adminApiClient.get('/schemas/projectmaster/projects/create');
  const createSchema = createSchemaResponse.data;
  console.log('   -> Received Schema Title:', createSchema.title);
  console.log('   -> Required Fields:', createSchema.required);

  // 2. UI uses the schema to build a form. User fills it out. UI sends the data.
  const newProjectData = { name: 'New Marketing Campaign' };
  console.log(`\n2. Executing "create project" action with data:`, newProjectData);
  const createResponse = await adminApiClient.post('/projectmaster/projects/create', newProjectData);
  console.log('   -> Received new project:', createResponse.data);

  // 3. UI needs to display a list of all projects. It asks for the list schema first.
  console.log('\n3. Fetching schema for "list projects" action...');
  const listSchemaResponse = await adminApiClient.get('/schemas/projectmaster/projects/list');
  const listSchema = listSchemaResponse.data;
  console.log('   -> Received Schema Title:', listSchema.title);

  // 4. UI executes the list action to get the data.
  console.log('\n4. Executing "list projects" action...');
  const listResponse = await adminApiClient.get('/projectmaster/projects/list');
  console.log('   -> Received project list:', listResponse.data);

  // 5. UI uses the schema and data to render a table (we'll just log it).
  console.log('\n   --- Rendering Project Table ---');
  console.log(listSchema.columns.map(c => c.label).join('\t| '));
  listResponse.data.forEach(proj => {
    console.log(listSchema.columns.map(c => proj[c.key]).join('\t| '));
  });
  console.log('   -----------------------------');
}

runDemo().catch(error => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data);
  } else {
    console.error('Error:', error.message);
  }
});