export default class ConfigurationAdapter {
  constructor({ configurationService }) {
    this.service = configurationService;
  }

  // --- FIX #1: This method's signature was inconsistent. ---
  // It should only accept the context object, just like our newer adapters.
  async getAll(context) { 
    const items = await this.service.getAll();
    return { response: items };
  }

  // --- FIX #2: This method's signature and logic were the source of the crash. ---
  async update(context) { 
    const { req, user } = context; // Get req from the context object
    const { key, value } = req.body; // Now req.body will be defined
    const updatedItem = await this.service.update(key, value);
    
    return {
      response: updatedItem,
      payloads: {
        audit: { message: `User ${user.email} updated configuration key '${key}'.` },
      },
    };
  }
}