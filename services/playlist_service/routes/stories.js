const express = require('express');
const router = express.Router();
const {
  getAllStories,
  getStory,
  createStory,
  updateStory,
  deleteStory,
  toggleFavorite,
  incrementPlayCount
} = require('../controllers/storyController');

router.route('/')
  .get(getAllStories)
  .post(createStory);

router.route('/:id')
  .get(getStory)
  .put(updateStory)
  .delete(deleteStory);

router.patch('/:id/favorite', toggleFavorite);
router.patch('/:id/play', incrementPlayCount);

module.exports = router;