const express = require('express');
const router = express.Router();
const {
  calculateBikeSize,
  saveBikeSizeCalculation,
  getUserCalculations,
  deleteCalculation
} = require('../controllers/bike-size-controller');
const { protect } = require('../middleware/auth');

// Public route - calculate bike size without saving
router.post('/calculate', calculateBikeSize);

// Protected routes - require authentication
router.post('/save', protect, saveBikeSizeCalculation);
router.get('/my-calculations', protect, getUserCalculations);
router.delete('/:id', protect, deleteCalculation);

module.exports = router;
