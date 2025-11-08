const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for user authentication
 * @param {number|string} userId - The user's ID to encode in the token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your_secret_key_here', {
    expiresIn: '30d', // Token expires in 30 days
  });
};

module.exports = generateToken;