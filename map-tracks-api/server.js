const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const initDB = require('./config/init-db');

// Load environment variables
dotenv.config();

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tracks', require('./routes/tracks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/favorites', require('./routes/favorites')); // Add new favorites routes
app.use('/api/bike-size', require('./routes/bike-size')); // Add bike size calculator routes
app.use('/api/reviews', require('./routes/reviews')); // Add reviews routes

// Default route
app.get('/', (req, res) => {
  res.send('Map Tracks API is running');
});

// Initialize database and start server
const startServer = async () => {
  await connectDB();
  await initDB();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();