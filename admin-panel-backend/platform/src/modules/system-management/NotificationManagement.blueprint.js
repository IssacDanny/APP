export default {
  resource: {
    // This top-level resource acts as a navigation group
    name: 'notifications',
    prefix: '/system/notifications', // Base prefix for all routes in this module
  },
  uiSchema: {
    title: 'Notifications', // The main title in the navigation sidebar
    icon: 'bell',
    items: [ // This array will create sub-navigation items or tabs in the UI
      {
        type: 'resource',
        id: 'notification-templates',
        name: 'Templates', // The label for the first tab/link
        icon: 'file-text',
        endpoint: '/system/notifications/templates',
        views: {
          listView: {
            columns: [
              { field: 'id', header: 'Template ID' },
              { field: 'name', header: 'Name' },
              { field: 'type', header: 'Type (e.g., email, sms)' },
            ],
          },
        },
        actions: [], // Read-only for now
      },
      {
        type: 'resource',
        id: 'notification-history',
        name: 'History', // The label for the second tab/link
        icon: 'history',
        endpoint: '/system/notifications/history',
        views: {
          listView: {
            columns: [
              { field: 'timestamp', header: 'Timestamp', type: 'datetime' },
              { field: 'recipient', header: 'Recipient' },
              { field: 'type', header: 'Type' },
              { field: 'status', header: 'Status' },
            ],
          },
        },
        actions: [], // Read-only
      },
    ],
  },
  routes: [
    {
      path: '/templates',
      method: 'GET',
      handler: 'notificationAdapter.getTemplates',
      interceptors: [{ name: 'rbac', options: { allowedRoles: ['admin', 'support-manager'] } }],
    },
    {
      path: '/history',
      method: 'GET',
      handler: 'notificationAdapter.getHistory',
      interceptors: [{ name: 'rbac', options: { allowedRoles: ['admin', 'support-manager'] } }],
    },
  ],
};