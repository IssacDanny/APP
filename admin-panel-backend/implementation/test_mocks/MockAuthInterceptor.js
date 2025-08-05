// This is a shared, reusable mock for our test suites.
export const mockAuthInterceptor = {
  preHandle: (context) => {
    const token = context.req.headers['authorization']?.split(' ')[1];
    let user = null;
    if (token === 'admin-token') {
      user = { id: 'user-1', email: 'admin@test.com', roles: ['admin'] };
    } else if (token === 'editor-token') {
      user = { id: 'user-2', email: 'editor@test.com', roles: ['editor'] };
    }
    context.user = user; // This is the crucial part
    return Promise.resolve();
  },
};