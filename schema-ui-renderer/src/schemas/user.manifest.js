export const userManifest = {
  resourceId: 'users',
  viewSchema: {
    type: 'view',
    viewType: 'table',
    title: 'System Users',
    columns: [
      { key: 'id', label: 'User ID' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email Address' },
    ],
  },
  actions: {
    create: {
      label: 'Invite New User',
      formSchema: {
        title: 'Invite User',
        type: 'object',
        required: ['fullName', 'email'],
        properties: {
          fullName: { type: 'string', title: 'Full Name' },
          email: { type: 'string', title: 'Email Address', format: 'email' },
          role: { type: 'string', title: 'Role', enum: ['Admin', 'Editor', 'Viewer'], default: 'Viewer' },
        },
      },
    },
    // No update or delete for users in this example to show it's optional
  },
};

export const userData = [
  { id: 101, fullName: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: 102, fullName: 'Bob Williams', email: 'bob@example.com', role: 'Editor' },
];