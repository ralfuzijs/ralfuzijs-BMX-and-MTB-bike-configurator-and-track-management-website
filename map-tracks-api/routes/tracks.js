const express = require('express');
const router = express.Router();
const { 
  getTracks, 
  getTrackById,
  addTrack, 
  updateTrack, 
  deleteTrack 
} = require('../controllers/track-controller');

// Routes for /api/tracks
router
  .route('/')
  .get(getTracks)
  .post(addTrack);

// Routes for /api/tracks/:id
router
  .route('/:id')
  .get(getTrackById)
  .put(updateTrack)
  .delete(deleteTrack);

module.exports = router;