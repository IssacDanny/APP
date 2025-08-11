export default {
  resource: {
    name: 'monitoring',
    prefix: '/system/monitoring',
  },
  uiSchema: {
    title: 'Monitoring',
    icon: 'activity',
    items: [
      {
        type: 'resource',
        id: 'api-metrics',
        name: 'API Metrics',
        icon: 'bar-chart-2',
        endpoint: '/system/monitoring/metrics',
        views: {
          listView: {
            columns: [
              { field: 'timestamp', header: 'Timestamp', type: 'datetime' },
              { field: 'method', header: 'Method' },
              { field: 'path', header: 'Path' },
              { field: 'statusCode', header: 'Status' },
              { field: 'durationMs', header: 'Duration (ms)' },
            ],
          },
          // We could later add a 'dashboardView' with charts here
        },
        actions: [], // Read-only view
      },
    ],
  },
  routes: [
    {
      path: '/metrics',
      method: 'GET',
      handler: 'monitoringAdapter.getMetrics',
      interceptors: ['authentication', { name: 'rbac', options: { allowedRoles: ['admin'] } }],
    },
  ],
};