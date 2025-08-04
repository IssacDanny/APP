import { configureContainer } from '../container.js';
import { createApp, registerErrorHandlers } from './App.js';
import { BlueprintInterpreter } from './BlueprintInterpreter.js';

const PORT = process.env.PORT || 4000;

/**
 * The main startup function for the entire application.
 */
export async function startServer(testOverrides) {
  try {
    // 1. Configure the IoC container
    const container = await configureContainer(testOverrides);

    // 2. Create the base Express app
    const app = createApp();
    container.register({ app: { resolve: () => app } }); // Make app available in container if needed

    // 3. Interpret blueprints to build routes and logic
    const interpreter = new BlueprintInterpreter({ app, container });
    await interpreter.interpretAndBuild();

    // 4. Register final error handlers (must be last)
    registerErrorHandlers(app);

    // 5. Start the server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
    });

    return app; // Return the app for testing purposes
  } catch (err) {
    console.error('🔥 Failed to start server:', err);
    process.exit(1);
  }
}