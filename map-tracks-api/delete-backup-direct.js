// Direct SQLite script to delete the Users_backup table
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database
const dbPath = path.resolve(__dirname, 'data/bmx-mtb-website.sqlite');
console.log(`Database path: ${dbPath}`);

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.log('Database file does not exist!');
  process.exit(1);
}

// Connect to the database
console.log('Opening database connection...');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Error opening database: ${err.message}`);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
  
  // First, check if the table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users_backup'", (err, row) => {
    if (err) {
      console.error(`Error checking for table: ${err.message}`);
      closeDatabase();
      return;
    }
    
    if (row) {
      console.log('Users_backup table found. Attempting to delete...');
      
      // Drop the table
      db.run("DROP TABLE IF EXISTS Users_backup", function(err) {
        if (err) {
          console.error(`Error deleting table: ${err.message}`);
        } else {
          console.log(`Users_backup table successfully deleted.`);
        }
        
        // Verify the deletion
        verifyTableDeleted();
      });
    } else {
      console.log('Users_backup table not found. Nothing to delete.');
      closeDatabase();
    }
  });
});

// Function to verify the table is gone
function verifyTableDeleted() {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users_backup'", (err, row) => {
    if (err) {
      console.error(`Error verifying deletion: ${err.message}`);
    } else if (row) {
      console.log('WARNING: Users_backup table is still present!');
    } else {
      console.log('Verification complete: Users_backup table has been removed.');
    }
    closeDatabase();
  });
}

// Function to close the database connection
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error(`Error closing database: ${err.message}`);
    } else {
      console.log('Database connection closed.');
    }
  });
}
