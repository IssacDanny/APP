const express = require('express');
const router = express.Router();
const { getAdapter } = require('../adapters');

const adapterMiddleware = (req, res, next) => {
  try {
    req.adapter = getAdapter(req.params.entity);
    next();
  } catch (error) { next(error) }
};

router.all('/:entity/:resource/:action', adapterMiddleware, async (req, res, next) => {
  try {
    const { resource, action } = req.params;
    const args = req.method === 'GET' ? req.query : req.body;
    const result = await req.adapter.executeAction(resource, action, args);
    res.status(req.method === 'POST' ? 201 : 200).json(result);
  } catch (error) { next(error) }
});

router.get('/schemas/:entity/:resource/:action', adapterMiddleware, async (req, res, next) => {
  try {
    const { resource, action } = req.params;
    const schema = await req.adapter.getSchemaForAction(resource, action);
    res.json(schema);
  } catch (error) { next(error) }
});

module.exports = router;