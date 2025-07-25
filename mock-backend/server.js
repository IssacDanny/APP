// mock-backend/server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const { db, getNextId } = require('./db');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', req.body);
  }
  next();
});


// ========================================================
//  SCHEMA ENDPOINT
// ========================================================
app.get('/api/schemas', async (req, res) => {
  const schemasDir = path.join(__dirname, 'schemas');
  try {
    const files = await fs.readdir(schemasDir);
    const readFilePromises = files
      .filter(file => file.endsWith('.json'))
      .map(file => fs.readFile(path.join(schemasDir, file), 'utf-8'));
    const fileContents = await Promise.all(readFilePromises);
    const serviceSchemas = fileContents.map(content => JSON.parse(content));
    res.status(200).json(serviceSchemas);
  } catch (error) {
    console.error("Failed to serve schemas:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ========================================================
//  DYNAMIC CRUD API ENDPOINTS
// ========================================================

const resources = ['products', 'orders', 'posts', 'authors', 'pages', 'users'];

resources.forEach(resource => {
  const resourceData = db[resource];
  if (!resourceData) return;

  // GET /<resource> (List all items)
  app.get(`/${resource}`, (req, res) => {
    setTimeout(() => { // Simulate network delay
      res.status(200).json(resourceData);
    }, 200);
  });

  // GET /<resource>/:id (Get single item)
  app.get(`/${resource}/:id`, (req, res) => {
    const item = resourceData.find(d => d.id == req.params.id);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: `${resource} not found` });
    }
  });

  // POST /<resource> (Create new item)
  app.post(`/${resource}`, (req, res) => {
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    // Note: Simple POST, doesn't handle all field types
    const newItem = {
      ...req.body,
      id: getNextId(resource),
    };
    resourceData.push(newItem);
    console.log(`  -> Created new ${resource}:`, newItem);
    res.status(201).json(newItem);
  });
});


// ========================================================
//  SPECIAL-CASE ENDPOINTS
// ========================================================

// POST /auth/logout
app.post('/auth/logout', (req, res) => {
  res.status(200).json({ message: 'You have been successfully logged out.' });
});


// ========================================================
//  Start the Server
// ========================================================
app.listen(PORT, () => {
  console.log(`🚀 Comprehensive Mock Backend Server is running on http://localhost:${PORT}`);
});