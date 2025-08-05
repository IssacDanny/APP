// implementation/src/services/ProductService.js
import { HttpError } from '#platform/core/errors.js';

export default class ProductService {
  /**
   * Generates a custom inventory report.
   * It now receives the full context object from the lifecycle handler.
   * @param {import('express').Request} req
   * @param {object} context - Contains the authenticated user and other lifecycle data
   */
  async generateInventoryReport(req, context) { // <-- CORRECTED SIGNATURE
    // The user is now reliably on the context object.
    if (!context.user) {
      throw new HttpError('Authentication required.', 401);
    }

    const reportData = {
      generatedBy: context.user.email, // <-- Use context.user
      generatedAt: new Date().toISOString(),
      inventory: [
        { sku: 'ABC-123', stock: 100 },
        { sku: 'XYZ-789', stock: 250 },
      ],
    };

    return {
      status: 200,
      response: reportData,
      payloads: {
        audit: {
          message: `User ${context.user.email} generated the inventory report.`, // <-- Use context.user
        },
      },
    };
  }
}