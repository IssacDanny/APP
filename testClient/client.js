// client.js - A script to test our Admin Panel Facade API

const axios = require('axios');

// --- Configuration ---
const BASE_URL = 'http://localhost:8080/api/v1';
const API_KEY = 'my-secret-key'; // This should match your .env file

// Create an axios instance with default settings for our client
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// --- Helper Functions for Logging ---
const log = (message) => console.log(`\n--- ${message} ---`);
const logSuccess = (data) => console.log('✅ SUCCESS:', JSON.stringify(data, null, 2));
const logError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('❌ FAILED with status:', error.response.status);
    console.error('   Error data:', JSON.stringify(error.response.data, null, 2));
  } else if (error.request) {
    // The request was made but no response was received
    console.error('❌ FAILED: No response received from server.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('❌ FAILED with error:', error.message);
  }
};

// --- Test Definitions ---
const tests = [
  // Test 1: Unauthorized request (should fail)
  async () => {
    log('Test 1: Unauthorized Request (expect 401)');
    // Temporarily create a client with NO api key
    const unauthorizedClient = axios.create({ baseURL: BASE_URL });
    await unauthorizedClient.get('/users');
  },

  // Test 2: Get Project Data
  async () => {
    log('Test 2: Get All Projects');
    const response = await apiClient.get('/projects');
    return response.data;
  },

  // Test 3: Get User Data
  async () => {
    log('Test 3: Get All Users');
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Test 4: Get Static Schema (Project List)
  async () => {
    log('Test 4: Get Project List Schema (Static)');
    const response = await apiClient.get('/schemas/projects/list');
    return response.data;
  },

  // Test 5: Get Dynamic Schema (User List)
  async () => {
    log('Test 5: Get User List Schema (Dynamic)');
    const response = await apiClient.get('/schemas/users/user-list');
    return response.data;
  },

  // Test 6: Create a New Project
  async () => {
    log('Test 6: Create a New Project');
    const newProjectData = {
      projectName: 'Client.js Test Project',
      budget: 12345,
    };
    const response = await apiClient.post('/projects', newProjectData);
    return response.data;
  },
];

// --- Test Runner ---
async function runTests() {
  console.log('🚀 Starting API tests for the Admin Panel Facade...');
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        logSuccess(result);
      }
    } catch (error) {
      logError(error);
    }
  }
  console.log('\n🏁 All tests finished.');
}

// Execute the test runner
runTests();