import { Router } from 'express';
// --- 1. Import the factory function, NOT the class ---
import { createAdapter } from '../../core/Adapter.js';
import { proxyRequest } from '../../core/utils/proxy.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const schema = require('./schema.json');


// --- 2. Define the function that returns the Express router ---
// This is the "LeetCode" area where a developer adds custom logic.
function getRoutes() {
  const SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;

  if (!SERVICE_URL) {
    throw new Error("FATAL: PRODUCTS_SERVICE_URL is not defined in the .env file for the Products service.");
  }

  const router = Router();

  // --- (OPTIONAL) CUSTOM ROUTES ---
  /*
   * To handle a specific path differently, define its route here,
   * ABOVE the generic proxy handler.
   *
   * Example:
   * router.get('/special-offer', (req, res, next) => {
   *   res.json({ message: 'This is a custom response for a special offer!' });
   * });
  */

  // --- GENERIC PROXY HANDLER (Catch-all) ---
  // This handles all standard REST requests like GET /, GET /:id, POST /, DELETE /:id, etc.
  router.all(/^\/.*/, async (req, res, next) => {
    try {
      const { status, data } = await proxyRequest({ serviceUrl: SERVICE_URL, req });
      res.status(status).json(data);
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}


// --- 3. Create and export the adapter using the factory ---
// This is pure configuration. It's simple, declarative, and foolproof.
const productsAdapter = createAdapter({
  resourcePrefix: '/products',
  schema: schema,
  getRoutes: getRoutes, // Pass the function we just defined
  // middleware: [], // Optionally add middleware here
});

export default productsAdapter;