export default {
  resource: {
    name: 'rateLimiting',
    prefix: '/security/rate-limiting',
  },
  uiSchema: {
    title: 'Security',
    icon: 'shield',
    items: [
      {
        type: 'resource',
        id: 'rate-limit-status',
        name: 'Rate Limiting',
        icon: 'bar-chart',
        // In the future, this could be a custom dashboard view
        endpoint: '/security/rate-limiting/status',
        views: {
          listView: {
            columns: [{ field: 'message', header: 'Status' }],
          },
        },
      },
    ],
  },
  routes: [
    {
      path: '/status',
      method: 'GET',
      handler: 'rateLimitAdapter.getStatus', // A placeholder handler
      interceptors: [{ name: 'rbac', options: { allowedRoles: ['admin'] } }],
    },
  ],
};