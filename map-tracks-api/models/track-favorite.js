const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Track = require('./track');

const TrackFavorite = sequelize.define('TrackFavorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  trackId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Track,
      key: 'id'
    }
  },
  // Optional fields to make querying easier
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  trackName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Create associations
User.hasMany(TrackFavorite, { foreignKey: 'userId' });
TrackFavorite.belongsTo(User, { foreignKey: 'userId' });

Track.hasMany(TrackFavorite, { foreignKey: 'trackId' });
TrackFavorite.belongsTo(Track, { foreignKey: 'trackId' });

module.exports = TrackFavorite;
