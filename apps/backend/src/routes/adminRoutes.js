const express = require('express');
const router = express.Router();
const { getAdapter } = require('../adapters');

// This middleware dynamically gets the adapter based on the URL parameter
// and attaches it to the request object for later handlers to use.
const adapterMiddleware = (req, res, next) => {
  try {
    req.adapter = getAdapter(req.params.entity);
    next();
  } catch (error) {
    next(error);
  }
};

// --- Generic CRUD Routes ---
// These 5 routes can now handle CRUD for ANY entity that implements the interface.

// Generic LIST route
router.get('/:entity', adapterMiddleware, async (req, res, next) => {
  try {
    const data = await req.adapter.list(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Generic CREATE route
router.post('/:entity', adapterMiddleware, async (req, res, next) => {
  try {
    const newItem = await req.adapter.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

// ... you could easily add generic GET by ID, UPDATE, and DELETE routes here ...


// --- Generic SCHEMA Route ---
// This route also becomes simpler.
router.get('/schemas/:entity/:context', adapterMiddleware, async (req, res, next) => {
  try {
    const schema = await req.adapter.getSchema(req.params.context);
    res.json(schema);
  } catch (error) {
    next(error);
  }
});

module.exports = router;