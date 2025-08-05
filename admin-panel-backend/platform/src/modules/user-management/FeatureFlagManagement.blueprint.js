export default {
  resource: {
    name: 'featureFlags',
    prefix: '/security/feature-flags',
  },
  uiSchema: {
    title: 'Security', // This will group it with Rate Limiting in the nav
    icon: 'shield',
    items: [
      {
        type: 'resource',
        id: 'feature-flag-list',
        name: 'Feature Flags',
        icon: 'toggle-right',
        endpoint: '/security/feature-flags',
        views: {
          listView: {
            columns: [
              { field: 'name', header: 'Flag Name', readonly: true },
              { field: 'description', header: 'Description', readonly: true },
              // The UI will render this as a toggle switch
              { field: 'isEnabled', header: 'Status', editable: true, type: 'boolean' },
            ],
          },
        },
        actions: [
          { // The action behind the boolean toggle switch in the table
            type: 'simpleApiAction',
            id: 'toggle-flag',
            name: 'Toggle',
            target: 'item',
            method: 'PUT',
            endpoint: '/security/feature-flags/{name}/toggle',
          },
        ],
      },
    ],
  },
  routes: [
    {
      path: '/',
      method: 'GET',
      handler: 'featureFlagAdapter.getFlags',
      interceptors: [{ name: 'rbac', options: { allowedRoles: ['admin', 'product-manager'] } }],
    },
    {
      path: '/:flagName/toggle',
      method: 'PUT',
      handler: 'featureFlagAdapter.toggleFlag',
      interceptors: ['authentication', { name: 'rbac', options: { allowedRoles: ['admin', 'product-manager'] } }, 'auditing'],
    },
  ],
};