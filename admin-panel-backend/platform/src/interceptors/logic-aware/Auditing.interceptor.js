/**
 * A logic-aware interceptor that logs actions based on payloads from the business logic.
 */
export default class AuditingInterceptor {
  /**
   * The constructor receives its dependencies from the IoC container.
   * @param {{ auditLogService: import('../../services/AuditLogService.js').AuditLogService }} dependencies
   */
  constructor({ auditLogService }) {
    if (!auditLogService) {
      throw new Error('AuditingInterceptor requires an AuditLogService.');
    }
    this.auditLogService = auditLogService;
  }

  /**
   * This method runs AFTER the main route handler.
   * @param {object} context - The request context object.
   */
  async postHandle(context) {
    // Look for the specific payload provided by the service method.
    const auditPayload = context.payloads?.audit;

    if (auditPayload) {
      // If the developer's logic provided a payload, log it.
      await this.auditLogService.log(
        auditPayload.message,
        auditPayload.details
      );
    }
    // If no payload is provided, this interceptor does nothing.
  }
}