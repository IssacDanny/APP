import { z } from 'zod'; // <-- ADD THIS LINE
import { envSchema } from './schema.js';

/**
 * Parses and validates environment variables on application startup.
 * If validation fails, the process will exit with a clear error message.
 */
function validateAndExportConfig() {
  try {
    const validatedConfig = envSchema.parse(process.env);
    console.log('✅ Environment configuration validated successfully.');
    return validatedConfig;
  } catch (err) {
    // Now 'z' is defined, and we can check the error type correctly.
    if (err instanceof z.ZodError) { // <-- CHANGE 'Zod' to lowercase 'z'
      console.error('🔥 Invalid environment configuration:');
      for (const issue of err.issues) {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      }
    } else {
      console.error('🔥 An unexpected error occurred during config validation:', err);
    }
    process.exit(1);
  }
}

// Immediately validate and export the configuration.
export const config = validateAndExportConfig();