const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getReviewsForTrack,
  getUserReviewForTrack,
  addReview,
  updateReview,
  deleteReview,
  getTrackReviewStats
} = require('../controllers/review-controller');

// Public routes
router.get('/track/:trackId', getReviewsForTrack);
router.get('/track/:trackId/stats', getTrackReviewStats);

// Protected routes (require authentication)
router.get('/track/:trackId/user', protect, getUserReviewForTrack);
router.post('/', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
