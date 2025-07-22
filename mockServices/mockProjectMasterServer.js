const express = require('express');
const app = express();
app.use(express.json());
app.get('/projects', (req, res) => res.json([{ id: 'p1', name: 'Website Redesign' }]));
app.post('/projects', (req, res) => res.status(201).json({ id: `p-${Date.now()}`, name: req.body.name }));
app.listen(3002, () => console.log('Mock ProjectMaster running on port 3002'));