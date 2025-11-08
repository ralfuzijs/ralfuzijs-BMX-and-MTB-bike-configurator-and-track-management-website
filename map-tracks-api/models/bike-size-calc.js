const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BikeSizeCalc = sequelize.define('BikeSizeCalc', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 50, // minimum 50cm
      max: 250 // maximum 250cm
    }
  },
  recommendedFrameSize: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bikeType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'MTB',
    validate: {
      isIn: [['MTB', 'BMX_FREESTYLE', 'BMX_RACING']]
    }
  },
  calculationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'bike_size_calculations',
  timestamps: true
});

module.exports = BikeSizeCalc;
