export default class MonitoringInterceptor {
  constructor({ monitoringService }) {
    if (!monitoringService) {
      throw new Error("MonitoringInterceptor requires a 'monitoringService'.");
    }
    this.service = monitoringService;
  }

  // Record the start time before the handler runs
  async preHandle(context) {
    context.startTime = process.hrtime.bigint();
  }

  // After the request is finished, record the final metric
  async postHandle(context) {
    const { req, result, error, startTime } = context;
    if (!startTime) return;

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    // --- FIX #4: Make the interceptor resilient to failures ---
    const statusCode = error ? (error.statusCode || 500) : (result ? result.status : 500);

    this.service.recordMetric({
      method: req.method,
      path: req.baseUrl + req.path,
      statusCode: statusCode, // Use the safe status code
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }
}