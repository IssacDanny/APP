// This generic adapter defines the API handlers.
// It relies on a 'configurationService' being injected by the developer.
export default class ConfigurationAdapter {
  constructor({ configurationService }) {
    if (!configurationService) {
      throw new Error("ConfigurationAdapter requires a 'configurationService' to be registered in the container.");
    }
    this.service = configurationService;
  }

  // Corresponds to GET /
  async getAll() {
    const items = await this.service.getAll();
    return { response: items };
  }

  // Corresponds to PUT /
  async update(req, context) {
    const { key, value } = req.body; // The UI will send the full row, we extract what we need.
    const updatedItem = await this.service.update(key, value);
    
    // For our logic-aware AuditingInterceptor
    return {
      response: updatedItem,
      payloads: {
        audit: { message: `User ${context.user.email} updated configuration key '${key}'.` },
      },
    };
  }
}