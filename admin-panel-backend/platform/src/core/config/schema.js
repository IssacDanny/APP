import { z } from 'zod';

/**
 * Defines the schema for all environment variables required by the platform.
 * Using Zod helps validate and provide defaults, ensuring the app starts with a sane configuration.
 */
export const envSchema = z.object({
  // --- Core Platform Settings ---
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),

  // --- Security Settings ---
  // In production, you would want to enforce a minimum length.
  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters long" }),
  
  // --- Service Dependencies ---
  // We can make these optional if the services are not always needed.
  // For now, we'll assume Redis is required for rate limiting.
  REDIS_URL: z.string().url({ message: "Invalid REDIS_URL format" }).optional(),
});