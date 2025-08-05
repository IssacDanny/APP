export default {
  resource: {
    name: 'accessManagement',
    prefix: '/users', // We'll manage users at the top-level /users endpoint
  },
  uiSchema: {
    title: 'User Management',
    icon: 'users',
    items: [
      {
        type: 'resource',
        id: 'user-list',
        name: 'Users',
        icon: 'users',
        endpoint: '/users',
        views: {
          listView: {
            columns: [
              { field: 'id', header: 'User ID' },
              { field: 'email', header: 'Email' },
              { field: 'roles', header: 'Roles', type: 'tags' }, // The UI can render an array as tags
            ],
          },
        },
        actions: [
          // An "Edit" button on each row to manage roles
          {
            type: 'form',
            id: 'edit-user-roles',
            name: 'Manage Roles',
            target: 'item',
            method: 'PUT',
            endpoint: '/users/{id}/roles', // A dedicated endpoint for role management
            formSchema: {
              schema: {
                title: 'Manage User Roles',
                type: 'object',
                properties: {
                  roles: {
                    type: 'array',
                    title: 'Assigned Roles',
                    items: { type: 'string' },
                  },
                },
              },
              uiSchema: {
                roles: {
                  'ui:widget': 'checkboxes', // Render as a list of checkboxes
                },
              },
            },
          },
        ],
      },
    ],
  },
  routes: [
    {
      path: '/',
      method: 'GET',
      handler: 'accessAdapter.getUsers',
      // FIX: Add 'authentication' BEFORE 'rbac'
      interceptors: [
        'authentication', 
        { name: 'rbac', options: { allowedRoles: ['admin'] } }
      ],
    },
    {
      path: '/:id/roles',
      method: 'PUT',
      handler: 'accessAdapter.updateUserRoles',
      // This route was already correct, but let's ensure it stays this way.
      interceptors: [
        'authentication',
        { name: 'rbac', options: { allowedRoles: ['admin'] } },
        'auditing',
        {
          name: 'rateLimiting',
          options: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 3, // Set to 3 for our test case
            // Group requests by the authenticated user's ID
            keyGenerator: (req, context) => `user:${context.user.id}`,
          },
        },
      ],
    },
  ],
};