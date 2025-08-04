// This is the single entry point to run the entire application.
import 'dotenv/config'; // Load environment variables from .env file
import { startServer } from '../platform/src/core/Server.js';

startServer();