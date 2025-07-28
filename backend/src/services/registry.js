/**
 * Registers all provided adapters with the Express application.
 * @param {import('express').Express} app - The Express app instance.
 * @param {Array<import('../core/Adapter').Adapter>} adapters - The adapter instances to register.
 */
export function registerAdapters(app, adapters) {
  console.log('🔌 Registering adapter routes...');
  
  // Register the aggregated schema endpoint first
  app.get('/api/v1/schemas/definitions', (req, res) => {
    const allSchemas = adapters.map(adapter => adapter.schema).flat();
    res.status(200).json(allSchemas);
  });
  console.log('  ✅ Schema definition endpoint registered at /api/v1/schemas/definitions');

  // Register the router for each adapter
  adapters.forEach(adapter => {
    try {
      const router = adapter.getRoutes();
      app.use(adapter.resourcePrefix, ...(adapter.middleware || []), router);
      console.log(`  ✅ Routes for '${adapter.resourcePrefix}' registered.`);
    } catch (e) {
      console.error(`  💥 CRITICAL ERROR registering router for '${adapter.resourcePrefix}':`, e);
    }
  });
  console.log('👍 All adapters registered.\n');
}