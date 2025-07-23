import { v4 as uuidv4 } from 'uuid';

// We wrap the manifest in an object where the key is the resource name
export const serviceManifest = {
  projects: { // This is the resource name
    viewSchema: {
      type: 'view',
      viewType: 'table',
      title: 'Company Projects',
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Project Name', sortable: true },
        { key: 'status', label: 'Status', displayAs: 'badge' },
      ],
    },
    actions: {
      // The crucial action to get the data for the view
      retrieve: {
        label: 'Refresh Projects',
        // In a real app, this would define the API endpoint
        // api: { method: 'get', path: '/api/projects' }
      },
      create: {
        label: 'Create New Project',
        // api: { method: 'post', path: '/api/projects' }
        formSchema: {
          title: 'New Project',
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', title: 'Project Name', default: 'New Website' },
            status: { type: 'string', title: 'Status', enum: ['Planning', 'Active', 'Completed'], default: 'Planning' },
          },
        },
      },
      update: {
        label: 'Update',
        // api: { method: 'put', path: '/api/projects/{id}' }
        formSchema: {
          title: 'Update Project',
          type: 'object',
          required: ['name'],
          properties: {
            id: { type: 'string', title: 'ID' },
            name: { type: 'string', title: 'Project Name' },
            status: { type: 'string', title: 'Status', enum: ['Planning', 'Active', 'Completed'] },
          },
        },
      },
      delete: {
        label: 'Delete',
        // api: { method: 'delete', path: '/api/projects/{id}' }
        formSchema: {
          title: 'Delete Project',
          type: 'object',
          description: "This action cannot be undone.",
          properties: {
            confirmation: { type: 'boolean', title: 'Are you sure you want to delete this project?', const: true },
          },
          required: ['confirmation'],
        },
      },
    },
  },
};

// Mock data for the demo
export const projectData = [
  { id: uuidv4(), name: 'Marketing Campaign Q3', status: 'Active' },
  { id: uuidv4(), name: 'New Billing System', status: 'Planning' },
  { id: uuidv4(), name: 'Customer Portal Launch', status: 'Completed' },
];