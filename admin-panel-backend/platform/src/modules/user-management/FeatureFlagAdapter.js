export default class FeatureFlagAdapter {
  constructor({ featureFlagService }) {
    if (!featureFlagService) {
      throw new Error("FeatureFlagAdapter requires a 'featureFlagService'.");
    }
    this.service = featureFlagService;
  }

  // GET /
  async getFlags() {
    const flags = await this.service.getFlags();
    return { response: flags };
  }

  // PUT /:flagName/toggle
  async toggleFlag(req, context) {
    const { flagName } = req.params;
    // The UI's inline toggle will send the new state in the body
    const { isEnabled } = req.body;
    const updatedFlag = await this.service.toggleFlag(flagName, isEnabled);
    
    return {
      response: updatedFlag,
      payloads: {
        audit: { message: `User ${context.user.email} set feature flag '${flagName}' to '${isEnabled}'.` },
      },
    };
  }
}