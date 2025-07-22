const express = require('express');
const app = express();
app.get('/projects', (req, res) => res.json([{ id: 'p1', name: 'New Website' }]));
app.post('/projects', (req, res) => res.status(201).json({ id: 'p2', ...req.body }));
app.listen(3002, () => console.log('Mock ProjectMaster running on port 3002'));