import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // This tells Vitest to run our setup file before any tests.
    setupFiles: ['./vitest.setup.js'],
    // We can also add a global timeout for all tests.
    testTimeout: 30000,
  },
});