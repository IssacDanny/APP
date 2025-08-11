// This adapter provides the data for the Monitoring UI.
export default class MonitoringAdapter {
  constructor({ monitoringService }) {
    if (!monitoringService) {
      throw new Error("MonitoringAdapter requires a 'monitoringService'.");
    }
    this.service = monitoringService;
  }

  // Corresponds to GET /metrics
  async getMetrics(context) {
    const metrics = await this.service.getMetrics();
    return { response: metrics };
  }
}