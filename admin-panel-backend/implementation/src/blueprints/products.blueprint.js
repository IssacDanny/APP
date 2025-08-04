export default {
  resource: {
    name: 'products',
    prefix: '/products',
  },
  uiSchema: {
    title: 'Product Management',
    // ... other UI details ...
  },
  routes: [
     {
      // The internal route
      path: '/external/:id',
      method: 'GET',
      handler: 'proxy',
      // The base URL of the external service
      targetServiceUrl: 'https://jsonplaceholder.typicode.com',
      // The path template for the external service
      downstreamPath: '/todos/:id', 
    },
    {
      // A route handled by our own business logic
      path: '/reports/inventory',
      method: 'GET',
      handler: 'productService.generateInventoryReport',
      interceptors: ['authentication', 'auditing'],
    },
  ],
};