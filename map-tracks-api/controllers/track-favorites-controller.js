const TrackFavorite = require('../models/track-favorite');
const Track = require('../models/track');
const User = require('../models/user');

// @desc    Add a track to user's favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const { trackId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({
        success: false,
        error: 'Track ID is required'
      });
    }

    // Check if track exists
    const track = await Track.findByPk(trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await TrackFavorite.findOne({
      where: {
        userId: req.user.id,
        trackId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Track is already in favorites'
      });
    }

    // Get user details for saving to the favorites table
    const user = await User.findByPk(req.user.id);

    // Create favorite
    const favorite = await TrackFavorite.create({
      userId: req.user.id,
      trackId,
      username: user.username,
      userEmail: user.email,
      trackName: track.name
    });

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Remove a track from user's favorites
// @route   DELETE /api/favorites/:trackId
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await TrackFavorite.findOne({
      where: {
        userId: req.user.id,
        trackId: req.params.trackId
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    await favorite.destroy();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all favorites for a user
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    // First get the basic favorites data
    const favorites = await TrackFavorite.findAll({
      where: {
        userId: req.user.id
      },
      include: [{
        model: Track,
        attributes: ['id', 'name', 'type', 'description', 'longitude', 'latitude', 'imageUrl']
      }]
    });

    // Format the response for the frontend
    const formattedFavorites = favorites.map(favorite => {
      const plainFav = favorite.toJSON ? favorite.toJSON() : { ...favorite };
      
      // Make sure Track data is formatted consistently
      if (plainFav.Track) {
        plainFav.Track = {
          id: plainFav.Track.id,
          name: plainFav.Track.name,
          type: plainFav.Track.type,
          description: plainFav.Track.description || '',
          location: {
            type: 'Point',
            coordinates: [plainFav.Track.longitude, plainFav.Track.latitude]
          },
          imageUrl: plainFav.Track.imageUrl || ''
        };
      }
      
      return plainFav;
    });

    console.log('Sending formatted favorites:', JSON.stringify(formattedFavorites, null, 2));

    res.status(200).json({
      success: true,
      data: formattedFavorites
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Check if a track is in user's favorites
// @route   GET /api/favorites/check/:trackId
// @access  Private
exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await TrackFavorite.findOne({
      where: {
        userId: req.user.id,
        trackId: req.params.trackId
      }
    });

    res.status(200).json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
