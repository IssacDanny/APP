import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ProxyError, HttpError } from './errors.js';
import { httpLogger } from './logger.js';
import { config } from './config/index.js';

/**
 * Creates and configures the base Express application.
 * @returns {import('express').Express} The configured Express app instance.
 */
export function createApp() {
  const app = express();

  // --- Core Middleware ---
  app.use(
    helmet({
      // Configure Content Security Policy (CSP)
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Only allow scripts, styles, etc., from our own domain by default
          // In development, we need to allow connections for Vite's Hot Module Replacement (HMR)
          // You might need to adjust the port if your frontend runs on a different one.
          connectSrc: config.NODE_ENV === 'development' ? ["'self'", "ws://localhost:5173"] : ["'self'"],
        },
      },
    })
  );
  app.use(httpLogger);
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