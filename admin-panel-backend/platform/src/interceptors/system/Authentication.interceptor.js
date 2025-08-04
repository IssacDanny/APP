/**
 * A system-level interceptor to handle basic authentication.
 * It checks for a token and attaches a mock user object to the context.
 */
export default class AuthenticationInterceptor {
  /**
   * This method runs BEFORE the main route handler.
   * @param {object} context - The request context object.
   */
  async preHandle(context) {
    const { req } = context;
    const token = req.headers['authorization'];

    if (!token || !token.startsWith('Bearer ')) {
      // In a real app, we'd throw an error to stop the request.
      // throw new AuthenticationError('Missing or invalid Bearer token', 401);
      console.warn('[AUTH] ⚠️ No Bearer token found. Proceeding without authentication.');
      return;
    }

    // In a real app, we would validate the token against a service.
    // For now, we'll just mock a user based on the token.
    const mockUser = {
      id: `user-${token.split(' ')[1]}`,
      email: `user-${token.split(' ')[1]}@example.com`,
      roles: ['editor'],
    };

    // Attach the user to the context for downstream interceptors and services to use.
    context.user = mockUser;
    console.log(`[AUTH] ✅ Authenticated user: ${mockUser.email}`);
  }

  // This interceptor doesn't need to do anything after the request.
  // async postHandle(context) {}
}