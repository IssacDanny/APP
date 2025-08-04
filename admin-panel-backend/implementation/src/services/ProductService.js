import { HttpError } from '#platform/core/errors.js';

export default class ProductService {
  async generateInventoryReport(req, res, next) {
    // The context is no longer passed from the interpreter,
    // but the user is attached to `req` by the pre-handler.
    if (!req.user) {
      // Throw an error to be caught by the global handler.
      throw new HttpError('Authentication required.', 401);
    }

    const reportData = {
      generatedBy: req.user.email,
      generatedAt: new Date().toISOString(),
      inventory: [
        { sku: 'ABC-123', stock: 100 },
        { sku: 'XYZ-789', stock: 250 },
      ],
    };

    // The service is now responsible for sending the response again.
    res.status(200).json(reportData);
  }
}