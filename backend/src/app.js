import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { ProxyError } from './core/utils/errors.js';

/**
 * Creates and configures the Express application.
 * @returns {import('express').Express} The configured Express app.
 */
export function createApp() {
  const app = express();

  // --- Core Middleware ---
  app.use(cors());
  app.use(express.json());

  // --- Global Error Handler ---
  // This should be the last piece of middleware.
  app.use((err, req, res, next) => {
    if (err instanceof ProxyError) {
      return res.status(err.statusCode).json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message,
        ...(process.env.NODE_ENV !== 'production' && { downstreamError: err.responseData }),
      });
    }

    console.error('💥 An uncaught server error occurred:', err.stack || err);
    res.status(500).json({ status: 'error', statusCode: 500, message: 'An internal server error occurred.' });
  });

  return app;
}