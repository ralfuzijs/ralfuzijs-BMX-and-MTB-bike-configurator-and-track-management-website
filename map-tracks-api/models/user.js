const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: '/images/default-profile.png'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  },
  permissions: {
    // Storing as JSON string
    type: DataTypes.TEXT,
    get() {
      return JSON.parse(this.getDataValue('permissions') || '[]');
    },
    set(val) {
      this.setDataValue('permissions', JSON.stringify(val));
    }
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  // Login history would be better in a separate table in a relational model
  loginHistory: {
    type: DataTypes.TEXT,
    get() {
      return JSON.parse(this.getDataValue('loginHistory') || '[]');
    },
    set(val) {
      this.setDataValue('loginHistory', JSON.stringify(val));
    }
  }
});

// Hooks for password hashing
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

// Instance method for password comparison
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to record login history
User.prototype.recordLogin = async function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  
  const loginHistory = this.loginHistory || [];
  loginHistory.push({
    timestamp: this.lastLogin,
    ipAddress,
    userAgent
  });
  
  // Keep only the last 10 login records
  this.loginHistory = loginHistory.slice(-10);
  
  return await this.save();
};

module.exports = User;