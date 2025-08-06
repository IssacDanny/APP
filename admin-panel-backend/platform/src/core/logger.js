import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';

// Configure Pino options
const pinoOptions = {
  level: config.LOG_LEVEL,
};

// In development, we want human-readable logs. In production, we want structured JSON.
if (config.NODE_ENV === 'development') {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  };
}

// Create the main logger instance
const logger = pino(pinoOptions);

// Create the HTTP logger middleware instance
const httpLogger = pinoHttp({ logger });

export { logger, httpLogger };