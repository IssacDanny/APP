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

    // --- FIX: NORMALIZE THE PATH ---
    // Combine baseUrl and path, then remove any trailing slash if it's not the root path.
    let fullPath = req.baseUrl + req.path;
    if (fullPath.length > 1 && fullPath.endsWith('/')) {
      fullPath = fullPath.slice(0, -1);
    }
    // --- END OF FIX ---

    this.service.recordMetric({
      method: req.method,
      path: fullPath, // Use the new normalized path
      statusCode: error ? (error.statusCode || 500) : result.status,
      durationMs,
      timestamp: new Date().toISOString(),
    });
  }
}