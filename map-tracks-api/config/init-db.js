const { sequelize } = require('./database');
const Track = require('../models/track');
const User = require('../models/user');
const TrackFavorite = require('../models/track-favorite'); 
const BikeSizeCalc = require('../models/bike-size-calc');
const Review = require('../models/review');
const fs = require('fs');
const path = require('path');

const initDB = async () => {
  try {
    // Define associations before any database operations
    setupAssociations();
    
    // Check if database file exists
    const dbPath = path.resolve(__dirname, '../data/bmx-mtb-website.sqlite');
    const isNewDatabase = !fs.existsSync(dbPath);
    
    if (isNewDatabase) {
      // For new database, create all tables
      console.log('Creating new database...');
      await sequelize.sync({ force: true });
      console.log('Database tables created');
    } else {
      console.log('Using existing database - checking for required tables');
      
      try {
        // Clean up any leftover backup tables from previous failed migrations
        await cleanupBackupTables();
        
        // Check for required tables individually rather than using alter: true
        const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
        const tableNames = tables.map(t => t.name);
        
        console.log('Existing tables:', tableNames);
          // Create TrackFavorites table if it doesn't exist
        // Use { force: false } to avoid dropping the table if it exists
        if (!tableNames.includes('TrackFavorites')) {
          console.log('Creating missing TrackFavorites table...');
          await TrackFavorite.sync({ force: false });
          console.log('TrackFavorites table created successfully');
        } else {
          console.log('TrackFavorites table already exists');
        }

        // Create BikeSizeCalcs table if it doesn't exist
        if (!tableNames.includes('bike_size_calculations')) {
          console.log('Creating missing bike_size_calculations table...');
          await BikeSizeCalc.sync({ force: false });
          console.log('bike_size_calculations table created successfully');
        } else {
          console.log('bike_size_calculations table already exists');
        }

        // Create Reviews table if it doesn't exist
        if (!tableNames.includes('Reviews')) {
          console.log('Creating missing Reviews table...');
          await Review.sync({ force: false });
          console.log('Reviews table created successfully');
        } else {
          console.log('Reviews table already exists');
        }

        console.log('Database schema check completed successfully');
      } catch (err) {
        console.error('Error updating database schema:', err);
        // Don't exit process, just log the error
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Continuing without schema changes...');
  }
};

// Helper function to clean up leftover backup tables from failed migrations
async function cleanupBackupTables() {
  try {
    // Get a list of all tables in the database
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    
    // Filter for backup tables
    const backupTables = tables
      .map(t => t.name)
      .filter(name => name.endsWith('_backup'));
    
    if (backupTables.length > 0) {
      console.log(`Found ${backupTables.length} backup tables, cleaning up...`);
      
      // Drop each backup table
      for (const tableName of backupTables) {
        await sequelize.query(`DROP TABLE IF EXISTS "${tableName}"`);
        console.log(`Dropped table ${tableName}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up backup tables:', error);
  }
}

// Setup model associations
function setupAssociations() {
  // User has many Reviews
  User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Review.belongsTo(User, { foreignKey: 'userId' });
  
  // Track has many Reviews
  Track.hasMany(Review, { foreignKey: 'trackId', onDelete: 'CASCADE' });
  Review.belongsTo(Track, { foreignKey: 'trackId' });
  
  // User has many TrackFavorites
  User.hasMany(TrackFavorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
  TrackFavorite.belongsTo(User, { foreignKey: 'userId' });
  
  // Track has many TrackFavorites
  Track.hasMany(TrackFavorite, { foreignKey: 'trackId', onDelete: 'CASCADE' });
  TrackFavorite.belongsTo(Track, { foreignKey: 'trackId' });
  
  // User has many BikeSizeCalcs
  User.hasMany(BikeSizeCalc, { foreignKey: 'userId', onDelete: 'CASCADE' });
  BikeSizeCalc.belongsTo(User, { foreignKey: 'userId' });
}

module.exports = initDB;