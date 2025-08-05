// This is a PLATFORM-provided blueprint. A developer can choose to use it.
export default {
  resource: {
    name: 'configuration',
    prefix: '/system/configuration',
  },
  uiSchema: {
    title: 'Configuration',
    icon: 'settings',
    items: [ // We wrap this in a group to give it a section title in the nav
      {
        type: 'resource',
        id: 'system-variables',
        name: 'Variables',
        icon: 'sliders',
        endpoint: '/system/configuration',
        views: {
          listView: {
            // A simple key-value table. The UI will handle the update logic.
            columns: [
              { field: 'key', header: 'Key', readonly: true },
              { field: 'value', header: 'Value', editable: true, type: 'text' },
              { field: 'description', header: 'Description', readonly: true },
              { field: 'lastModified', header: 'Last Modified', readonly: true, type: 'datetime' },
            ],
          },
        },
        actions: [
          // A dedicated action to update a variable.
          // The UI's data table will call this for the inline edit.
          {
            type: 'simpleApiAction',
            id: 'update-config',
            name: 'Update', // This name is not user-facing
            target: 'item', // This is an action on a specific row
            method: 'PUT',
            endpoint: '/system/configuration', // The body will contain the key/value pair
          },
        ],
      },
    ],
  },
  routes: [
    {
      path: '/',
      method: 'GET',
      handler: 'configurationAdapter.getAll',
      interceptors: [{ name: 'rbac', options: { allowedRoles: ['admin'] } }],
    },
    {
      path: '/',
      method: 'PUT',
      handler: 'configurationAdapter.update',
      interceptors: ['authentication', { name: 'rbac', options: { allowedRoles: ['admin'] } }, 'auditing'],
    },
  ],
};