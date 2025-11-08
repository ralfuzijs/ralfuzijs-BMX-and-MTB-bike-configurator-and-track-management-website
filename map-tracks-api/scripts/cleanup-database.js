const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup process...');

    // Check if database file exists
    const dbPath = path.resolve(__dirname, '../data/bmx-mtb-website.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.log('Database file does not exist!');
      process.exit(1);
    }

    // Get list of all tables
    const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Current tables in database:');
    tables.forEach(t => console.log(`- ${t.name}`));
    
    // Find all backup tables
    const backupTables = tables
      .map(t => t.name)
      .filter(name => name.endsWith('_backup'));
    
    if (backupTables.length > 0) {
      console.log(`\nFound ${backupTables.length} backup tables to clean up:`);
      
      // Drop each backup table
      for (const tableName of backupTables) {
        await sequelize.query(`DROP TABLE IF EXISTS "${tableName}"`);
        console.log(`✅ Dropped table ${tableName}`);
      }
      console.log('\nBackup tables cleanup completed successfully!');
    } else {
      console.log('\nNo backup tables found to clean up.');
    }
    
    console.log('\nChecking for TrackFavorites table...');
    const [favResults] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='TrackFavorites'");
    if (favResults.length === 0) {
      console.log('TrackFavorites table not found. Will be created when the server starts.');
    } else {
      console.log('TrackFavorites table exists.');
    }

    console.log('\nCleanup process completed successfully!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the function
cleanupDatabase();
