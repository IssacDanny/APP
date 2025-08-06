export default {
  resource: {
    name: 'authentication',
    prefix: '/auth',
  },
  // This module has no UI in the admin panel sidebar, so uiSchema is minimal
  uiSchema: {
    items: [],
  },
  routes: [
    {
      path: '/login',
      method: 'POST',
      // This is a public route, so no interceptors
      handler: 'authAdapter.login',
    },
  ],
};