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
  const SERVICE_URL = process.env.USERS_SERVICE_URL;

  if (!SERVICE_URL) {
    throw new Error("FATAL: USERS_SERVICE_URL is not defined for the Users service.");
  }

  const router = Router();

  // --- (OPTIONAL) CUSTOM ROUTES ---
  // The special '/activity-report' route is handled here, before the generic proxy.
  // This route is proxied just like the others, but defining it explicitly makes the
  // code clearer and would allow for custom logic if needed.
  router.get('/activity-report', async (req, res, next) => {
    try {
      const { status, data } = await proxyRequest({ serviceUrl: SERVICE_URL, req });
      res.status(status).json(data);
    } catch (error) {
      next(error);
    }
  });

  // --- GENERIC PROXY HANDLER (Catch-all) ---
  // This handles all other standard REST requests like GET /, GET /:id, POST /, etc.
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
const usersAdapter = createAdapter({
  resourcePrefix: '/users',
  schema: schema,
  getRoutes: getRoutes, // Pass the function we just defined
});

export default usersAdapter;