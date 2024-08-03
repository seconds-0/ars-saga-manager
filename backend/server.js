require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const { sequelize, User } = db;
const { router: authRoutes } = require('./routes/auth');
const characterRoutes = require('./routes/characters');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Ars Saga Manager API is running');
});

// Test the database connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    await sequelize.sync({ force: false });
    console.log('Database & tables created!');
    console.log('User model:', User);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

startServer();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});