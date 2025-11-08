// Script to create an admin user in the database
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = require('../models/user');
const path = require('path');
const fs = require('fs');

// Check if the database directory exists
const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created data directory');
}

async function createAdminUser() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');

    // Sync models to ensure tables are created
    await sequelize.sync();
    console.log('Database tables synced');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');
      
      // Hash the new password manually (bypass hooks)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      // Update the password directly
      await existingAdmin.update({ password: hashedPassword });
      
      console.log('Admin password updated successfully');
    } else {
      // Create admin user with pre-hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        permissions: JSON.stringify(['manage_users', 'manage_tracks', 'manage_settings'])
      });

      console.log('Admin user created successfully:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      });
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
    console.error(error.stack);
  } finally {
    // Don't close the connection to allow for logging
    console.log('Script completed');
  }
}

// Run the function
createAdminUser();
