export default class AuthAdapter {
  constructor({ authService }) {
    if (!authService) {
      throw new Error("AuthAdapter requires an 'authService'.");
    }
    this.service = authService;
  }

  // Corresponds to POST /login
  async login(context) {
    const { email, password } = context.req.body;
    const token = await this.service.login(email, password);
    
    // Return the token to the client
    return { response: { token } };
  }
}