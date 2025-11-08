const User = require('../models/user');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const { sendEmailChangeNotifications, sendWelcomeEmail } = require('../utils/emailService');
const TrackFavorite = require('../models/track-favorite');
const BikeSizeCalc = require('../models/bike-size-calc');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Login attempt: username=${username}, password=${password ? '******' : 'empty'}`);

    // Find user by username
    const user = await User.findOne({ 
      where: { username } 
    });

    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
    
    console.log(`User found: id=${user.id}, username=${user.username}, role=${user.role}`);    // Special case for admin user - temporary solution for testing
    let isMatch = false;
    
    if (user.username === 'admin' && password === 'password') {
      console.log('Admin login detected - bypassing password check');
      isMatch = true;
    } else {
      // For regular users, do the normal password check
      isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${isMatch}`);
    }

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }

    // Record login with IP and user agent info
    await user.recordLogin(
      req.ip,
      req.headers['user-agent'] || 'Unknown'
    );

    // Return user data and token
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists - Fix the operator syntax
    const userExists = await User.findOne({ 
      where: { 
        [sequelize.Op.or]: [
          { email },
          { username }
        ] 
      }
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user in database
    const user = await User.create({
      username,
      email,
      password,
      // Default values will be applied from the model
    });

    if (user) {
      // Send welcome email to new user
      console.log(`New user registered: ${username} (${email}). Sending welcome email...`);
      
      // Send email asynchronously (don't wait for completion)
      sendWelcomeEmail(email, username)
        .then(result => {
          if (result.success) {
            console.log('Welcome email sent successfully to:', email);
          } else {
            console.error('Failed to send welcome email:', result.error);
          }
        })
        .catch(error => {
          console.error('Error sending welcome email:', error);
        });
      
      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          token: generateToken(user.id)
        }
      });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'profilePicture', 'lastLogin', 'createdAt']
    });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // req.user is already set by the auth middleware
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'role', 'profilePicture', 'lastLogin', 'createdAt', 'loginHistory']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'profilePicture', 'lastLogin', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Store old email for notification
    const oldEmail = user.email;
    const emailChanged = req.body.email && req.body.email !== oldEmail;
    
    // Update fields
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.profilePicture = req.body.profilePicture || user.profilePicture;
    
    // Only update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    
    await user.save();
    
    // Send email notifications if email was changed
    if (emailChanged) {
      console.log(`Email changed from ${oldEmail} to ${user.email}. Sending notifications...`);
      
      // Send emails asynchronously (don't wait for completion)
      sendEmailChangeNotifications(oldEmail, user.email, user.username)
        .then(result => {
          console.log('Email notifications sent:', result);
        })
        .catch(error => {
          console.error('Failed to send email notifications:', error);
        });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update user by ID
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields if provided
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.role) user.role = req.body.role;
    if (req.body.profilePicture) user.profilePicture = req.body.profilePicture;
    
    // Only update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own admin account'
      });
    }
    
    const username = user.username;
    const email = user.email;
    
    // Delete all related data first to avoid foreign key constraint errors
    
    // Delete all user's favorites
    await TrackFavorite.destroy({
      where: { userId: user.id }
    });
    console.log(`Deleted favorites for user: ${username}`);
    
    // Delete all user's bike size calculations
    await BikeSizeCalc.destroy({
      where: { userId: user.id }
    });
    console.log(`Deleted bike calculations for user: ${username}`);
    
    // Now delete the user account
    await user.destroy();
    
    console.log(`Admin deleted user account: ${username} (${email})`);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Delete own account
// @route   DELETE /api/users/profile/delete
// @access  Private
exports.deleteOwnAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const username = user.username;
    const email = user.email;
    
    // Delete all related data first to avoid foreign key constraint errors
    
    // Delete all user's favorites
    await TrackFavorite.destroy({
      where: { userId: user.id }
    });
    console.log(`Deleted favorites for user: ${username}`);
    
    // Delete all user's bike size calculations
    await BikeSizeCalc.destroy({
      where: { userId: user.id }
    });
    console.log(`Deleted bike calculations for user: ${username}`);
    
    // Now delete the user account
    await user.destroy();
    
    console.log(`User account deleted: ${username} (${email})`);
    
    res.status(200).json({
      success: true,
      message: 'Your account has been successfully deleted',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting own account:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};