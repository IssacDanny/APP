// This adapter handles requests for the Notification Management UI.
export default class NotificationAdapter {
  constructor({ notificationService }) {
    if (!notificationService) {
      throw new Error("NotificationAdapter requires a 'notificationService' to be registered.");
    }
    this.service = notificationService;
  }

  // Corresponds to GET /templates
  async getTemplates() {
    const templates = await this.service.getTemplates();
    return { response: templates };
  }

  // Corresponds to GET /history
  async getHistory() {
    const history = await this.service.getHistory();
    return { response: history };
  }
}