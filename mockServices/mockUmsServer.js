const express = require('express');
const app = express();
app.get('/users', (req, res) => res.json([{ id: 'u1', name: 'Alice from UMS' }]));
app.listen(3001, () => console.log('Mock UMS running on port 3001'));