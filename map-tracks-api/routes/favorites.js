const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  addFavorite, 
  removeFavorite, 
  getFavorites,
  checkFavorite
} = require('../controllers/track-favorites-controller');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.route('/:trackId')
  .delete(removeFavorite);

router.get('/check/:trackId', checkFavorite);

module.exports = router;
