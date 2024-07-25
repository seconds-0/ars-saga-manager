const express = require('express');
const cors = require('cors');
require('dotenv').config();
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

// Test the database connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => {
    console.log('Error connecting to the database:', err);
  });

// Sync all models with database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Database & tables created!');
    console.log('User model:', User);  // This should now work
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('Error syncing database:', err));