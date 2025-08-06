export default class FeatureFlagAdapter {
  constructor({ featureFlagService }) {
    if (!featureFlagService) {
      throw new Error("FeatureFlagAdapter requires a 'featureFlagService'.");
    }
    this.service = featureFlagService;
  }

  // GET /
  async getFlags(context) {
    const flags = await this.service.getFlags();
    return { response: flags };
  }

  // PUT /:flagName/toggle
  async toggleFlag(context) {
    const { req, user } = context; // <-- Get req and user from context
    const { flagName } = req.params;
    const { isEnabled } = req.body;
    const updatedFlag = await this.service.toggleFlag(flagName, isEnabled);
    
    return {
      response: updatedFlag,
      payloads: {
        audit: { message: `User ${user.email} set feature flag '${flagName}' to '${isEnabled}'.` },
      },
    };
  }
}