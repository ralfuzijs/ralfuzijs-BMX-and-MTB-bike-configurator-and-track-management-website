const express = require('express');
const router = express.Router();
const { 
  registerUser,
  loginUser,
  getUsers,
  getUserProfile,
  getUserById,
  updateUserProfile,
  updateUser,
  deleteUser,
  deleteOwnAccount
} = require('../controllers/user-controller');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.delete('/profile/delete', protect, deleteOwnAccount);

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;