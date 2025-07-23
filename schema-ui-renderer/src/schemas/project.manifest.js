export const projectManifest = {
  resourceId: 'projects',
  viewSchema: {
    type: 'view',
    viewType: 'table',
    title: 'Company Projects',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Project Name' },
      { key: 'status', label: 'Status' },
    ],
  },
  actions: {
    create: {
      label: 'Create New Project',
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
      formSchema: {
        title: 'Update Project',
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', title: 'Project Name' },
          status: { type: 'string', title: 'Status', enum: ['Planning', 'Active', 'Completed'] },
        },
      },
    },
    delete: {
      label: 'Delete',
      formSchema: {
        title: 'Delete Project',
        type: 'object',
        properties: {
          confirmation: { type: 'boolean', title: 'Are you sure you want to delete this project? This cannot be undone.', default: false },
        },
      },
    },
  },
};

export const projectData = [
  { id: 1, name: 'Marketing Campaign Q3', status: 'Active' },
  { id: 2, name: 'New Billing System', status: 'Planning' },
  { id: 3, name: 'Customer Portal Launch', status: 'Completed' },
];