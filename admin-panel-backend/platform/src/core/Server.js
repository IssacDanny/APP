import { configureContainer } from '../container.js';
import { createApp, registerErrorHandlers } from './App.js';
import { BlueprintInterpreter } from './BlueprintInterpreter.js';
import { config } from './config/index.js';
import { logger } from './logger.js'; // <-- Import the logger directly

const PORT = config.PORT;

/**
 * The main startup function for the entire application.
 */
export async function startServer(testOverrides, testBlueprintPath) {
  let server; // <-- Define server variable in a broader scope

  const cleanup = async () => {
    logger.info('Cleaning up resources...');
    try {
      // Resolve any services with connections and close them
      const rateLimitStore = container.resolve('rateLimitStore');
      await rateLimitStore.close();
      // Add other services here, e.g., await databaseService.close();
    } catch (err) {
      logger.error({ err }, 'Error during resource cleanup.');
    }
  };

  const gracefulShutdown = (signal) => {
    logger.warn(`Received ${signal}, starting graceful shutdown.`);
    
    // 1. Stop the server from accepting new connections
    server.close(async (err) => {
      if (err) {
        logger.error({ err }, 'Error closing HTTP server.');
        process.exit(1);
      }
      
      logger.info('HTTP server closed. Starting resource cleanup.');
      // 2. Clean up connections (Redis, DB, etc.)
      await cleanup();
      
      logger.info('Graceful shutdown complete. Exiting.');
      // 3. Exit the process
      process.exit(0);
    });
  };
  
  try {
    const container = await configureContainer(testOverrides);
    // Overwrite the logger registration with the one from the container
    // This is important for tests that mock the logger
    const resolvedLogger = container.resolve('logger');

    const app = createApp();
    const handlerFactory = container.resolve('handlerFactory');
    const interpreter = new BlueprintInterpreter({ app, container, handlerFactory });

    await interpreter.interpretAndBuild(testBlueprintPath);
    registerErrorHandlers(app);
    
    server = app.listen(PORT, () => { // <-- Assign to the server variable
      resolvedLogger.info(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // --- GRACEFUL SHUTDOWN HANDLERS ---
    // SIGINT is for Ctrl+C in the terminal
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    // SIGTERM is for signals from process managers like Docker, Kubernetes, etc.
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    return app;
  } catch (err) {
    logger.fatal({ err }, '🔥 Failed to start server.'); // Use logger.fatal
    process.exit(1);
  }
}