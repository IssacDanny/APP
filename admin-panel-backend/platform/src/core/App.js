import express from 'express';
import cors from 'cors';
import { ProxyError, HttpError } from './errors.js';

/**
 * Creates and configures the base Express application.
 * @returns {import('express').Express} The configured Express app instance.
 */
export function createApp() {
  const app = express();

  // --- Core Middleware ---
  app.use(cors());       // Enable Cross-Origin Resource Sharing
  app.use(express.json()); // Enable JSON body parsing

  // --- Placeholder for a health check endpoint ---
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}

/**
 * Registers the final global error handling middleware.
 * This MUST be registered AFTER all other routes and middleware.
 * @param {import('express').Express} app The Express app instance.
 */
export function registerErrorHandlers(app) {
  app.use((err, req, res, next) => {
    // Handle our custom HTTP errors first
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        error: {
          type: err.name,
          message: err.message,
        },
      });
    }
    
    // Then handle proxy errors
    if (err instanceof ProxyError) {
      return res.status(err.statusCode).json({
        error: {
          type: 'ProxyError',
          message: err.message,
          downstreamError: err.downstreamError,
        },
      });
    }

    // Fallback for all other unexpected errors
    console.error('💥 An unhandled error occurred:', err);
    res.status(500).json({
      error: {
        type: 'InternalServerError',
        message: 'An internal server error occurred.',
      },
    });
  });
}