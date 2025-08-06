// vitest.setup.js (Corrected)
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'implementation/.env') });