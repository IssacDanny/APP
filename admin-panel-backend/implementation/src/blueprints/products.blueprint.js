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
      path: '/',
      method: 'POST',
      handler: 'proxy',
      targetServiceUrl: 'https://api.messy-saas.com',
      downstreamPath: '/items',
      // --- NEW: The Transformation Layer Definition ---
      transform: {
        // A function to transform the outgoing request body
        request: 'productTransformer.toExternal',
        // A function to transform the incoming response body
        response: 'productTransformer.toInternal',
      },
    },
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