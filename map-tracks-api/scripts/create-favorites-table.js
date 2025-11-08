const { sequelize } = require('../config/database');
const Track = require('../models/track');
const User = require('../models/user');
const TrackFavorite = require('../models/track-favorite');

async function createFavoritesTable() {
  try {
    console.log('Checking for TrackFavorites table...');
    
    // Check if table exists
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='TrackFavorites'");
    
    if (results.length === 0) {
      console.log('TrackFavorites table not found. Creating it...');
      
      // Force sync only this model
      await TrackFavorite.sync({ force: true });
      
      console.log('TrackFavorites table created successfully!');
    } else {
      console.log('TrackFavorites table already exists.');
    }
  } catch (error) {
    console.error('Error creating favorites table:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the function
createFavoritesTable();
