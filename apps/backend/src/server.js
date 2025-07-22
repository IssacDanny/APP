require('dotenv').config();
const express = require('express');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

app.use('/api/v1', authMiddleware, adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: err.message || 'Something broke!' });
});

app.listen(PORT, () => {
  console.log(`✅ Admin Facade is running on port ${PORT}`);
});