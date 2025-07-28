import { createApp } from './app.js';
import { loadAdapters } from './services/loader.js';
import { registerAdapters } from './services/registry.js';

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // 1. Create the base Express app
    const app = createApp();

    // 2. Load all service adapters
    const adapters = await loadAdapters();

    // 3. Register adapters with the app
    registerAdapters(app, adapters);

    // 4. Start listening for requests
    app.listen(PORT, () => {
      console.log(`🚀 Admin Panel Gateway is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("🔥 Failed to start server:", err);
    process.exit(1);
  }
}

startServer();