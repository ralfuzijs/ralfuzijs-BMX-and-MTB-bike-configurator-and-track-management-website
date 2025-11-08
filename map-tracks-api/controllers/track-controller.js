const Track = require('../models/track');
const TrackFavorite = require('../models/track-favorite');
const Review = require('../models/review');
const { sequelize } = require('../config/database');

// Helper function to format track data for frontend
const formatTrackForFrontend = async (track) => {
  const plainTrack = track.toJSON ? track.toJSON() : { ...track };
  
  try {
    const [reviewStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating
      FROM Reviews
      WHERE trackId = :trackId
    `, {
      replacements: { trackId: plainTrack.id }
    });
    
    const stats = reviewStats[0];
    
    return {
      _id: plainTrack.id.toString(),
      name: plainTrack.name,
      type: plainTrack.type,
      location: {
        type: 'Point',
        coordinates: [plainTrack.longitude, plainTrack.latitude]
      },
      description: plainTrack.description || '',
      imageUrl: plainTrack.imageUrl || '',
      createdAt: plainTrack.createdAt,
      reviewCount: parseInt(stats.totalReviews) || 0,
      averageRating: stats.averageRating ? Math.round(stats.averageRating * 10) / 10 : 0
    };
  } catch (error) {
    console.error('Error formatting track:', error);
    return {
      _id: plainTrack.id.toString(),
      name: plainTrack.name,
      type: plainTrack.type,
      location: {
        type: 'Point',
        coordinates: [plainTrack.longitude, plainTrack.latitude]
      },
      description: plainTrack.description || '',
      imageUrl: plainTrack.imageUrl || '',
      createdAt: plainTrack.createdAt,
      reviewCount: 0,
      averageRating: 0
    };
  }
};

// @desc    Get all tracks
// @route   GET /api/tracks
// @access  Public
exports.getTracks = async (req, res) => {
  try {
    const tracks = await Track.findAll();
    
    const formattedTracks = await Promise.all(
      tracks.map(track => formatTrackForFrontend(track))
    );
    
    return res.status(200).json({
      success: true,
      count: formattedTracks.length,
      data: formattedTracks
    });
  } catch (error) {
    console.error('Error in getTracks:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single track by ID
// @route   GET /api/tracks/:id
// @access  Public
exports.getTrackById = async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: await formatTrackForFrontend(track)
    });
  } catch (error) {
    console.error('Error in getTrackById:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
// @desc    Create a track
// @route   POST /api/tracks
// @access  Public
exports.addTrack = async (req, res) => {
  try {
    const existingTrackByName = await Track.findOne({
      where: { name: req.body.name }
    });
    
    if (existingTrackByName) {
      return res.status(400).json({
        success: false,
        error: 'Track with this name already exists'
      });
    }

    let longitude, latitude;
    
    if (req.body.location && req.body.location.coordinates) {
      [longitude, latitude] = req.body.location.coordinates;
    } else {
      longitude = req.body.longitude;
      latitude = req.body.latitude;
    }
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates are required'
      });
    }

    const track = await Track.create({
      name: req.body.name,
      type: req.body.type,
      longitude: longitude,
      latitude: latitude,
      description: req.body.description || '',
      imageUrl: req.body.imageUrl || ''
    });
    
    return res.status(201).json({
      success: true,
      data: await formatTrackForFrontend(track)
    });
    
  } catch (error) {
    console.error('Error in addTrack:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update a track
// @route   PUT /api/tracks/:id
// @access  Public
exports.updateTrack = async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    let updatedData = { ...req.body };
    if (req.body.location && req.body.location.coordinates) {
      updatedData.longitude = req.body.location.coordinates[0];
      updatedData.latitude = req.body.location.coordinates[1];
      delete updatedData.location;
    }
    
    await track.update(updatedData);
    const updatedTrack = await Track.findByPk(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: await formatTrackForFrontend(updatedTrack)
    });
  } catch (error) {
    console.error('Error in updateTrack:', error);
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete a track
// @route   DELETE /api/tracks/:id
// @access  Public
exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }
    
    await TrackFavorite.destroy({
      where: { trackId: req.params.id }
    });
    
    await Review.destroy({
      where: { trackId: req.params.id }
    });
    
    await track.destroy();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteTrack:', error);
    return res.status(500).json({
      success: false,
      error: 'Server Error: ' + (error.message || 'Unknown error')
    });
  }
};
