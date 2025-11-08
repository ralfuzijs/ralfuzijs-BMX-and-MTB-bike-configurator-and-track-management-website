const Review = require('../models/review');
const User = require('../models/user');
const Track = require('../models/track');
const { sequelize } = require('../config/database');

// @desc    Get all reviews for a specific track
// @route   GET /api/reviews/track/:trackId
// @access  Public
exports.getReviewsForTrack = async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Verify track exists
    const track = await Track.findByPk(trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    // Fetch reviews with user information
    const reviews = await Review.findAll({
      where: { trackId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    return res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      data: reviews
    });
  } catch (error) {
    console.error('Error in getReviewsForTrack:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get a user's review for a specific track
// @route   GET /api/reviews/track/:trackId/user
// @access  Private
exports.getUserReviewForTrack = async (req, res) => {
  try {
    const { trackId } = req.params;
    const userId = req.user.id;
    
    const review = await Review.findOne({
      where: { trackId, userId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }]
    });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error in getUserReviewForTrack:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add a review for a track
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { trackId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!trackId || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Track ID and rating are required'
      });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    // Verify track exists
    const track = await Track.findByPk(trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    // Check if user already reviewed this track
    const existingReview = await Review.findOne({
      where: { trackId, userId }
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this track. Please update your existing review instead.'
      });
    }
    
    // Create the review
    const review = await Review.create({
      userId,
      trackId,
      rating,
      comment: comment || ''
    });
    
    // Fetch the created review with user info
    const createdReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }]
    });
    
    return res.status(201).json({
      success: true,
      data: createdReview
    });
  } catch (error) {
    console.error('Error in addReview:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Find the review
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    // Check if the user owns this review
    if (review.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own reviews'
      });
    }
    
    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    // Update the review
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    
    await review.update(updateData);
    
    // Fetch updated review with user info
    const updatedReview = await Review.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }]
    });
    
    return res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    console.error('Error in updateReview:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Find the review
    const review = await Review.findByPk(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }
    
    // Check if the user owns this review or is an admin
    if (review.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own reviews'
      });
    }
    
    await review.destroy();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get review statistics for a track
// @route   GET /api/reviews/track/:trackId/stats
// @access  Public
exports.getTrackReviewStats = async (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Verify track exists
    const track = await Track.findByPk(trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    // Get review statistics using raw SQL for better performance
    const [results] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStars,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStars,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStars,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStars,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar
      FROM Reviews
      WHERE trackId = :trackId
    `, {
      replacements: { trackId }
    });
    
    const stats = results[0];
    
    return res.status(200).json({
      success: true,
      data: {
        totalReviews: parseInt(stats.totalReviews) || 0,
        averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0,
        distribution: {
          5: parseInt(stats.fiveStars) || 0,
          4: parseInt(stats.fourStars) || 0,
          3: parseInt(stats.threeStars) || 0,
          2: parseInt(stats.twoStars) || 0,
          1: parseInt(stats.oneStar) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error in getTrackReviewStats:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
