const express = require('express');
const app = express();
app.get('/users', (req, res) => res.json([{ id: 'u1', name: 'Alice' }]));

// This new endpoint provides the schema dynamically
app.get('/schemas/user-list', (req, res) => {
  console.log("Mock UMS: Providing 'user-list' schema dynamically.");
  res.json({
    title: 'User List',
    columns: [
      { key: 'id', label: 'User ID' },
      { key: 'name', label: 'Full Name' },
    ],
  });
});

app.listen(3001, () => console.log('Mock UMS running on port 3001'));