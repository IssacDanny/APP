// A placeholder implementation to satisfy the container.
const metrics = [];
export default class MonitoringService {
  async recordMetric(metric) { metrics.push(metric); }
  async getMetrics() { return metrics; }
}