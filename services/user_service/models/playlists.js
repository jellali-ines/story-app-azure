const express = require('express');
const router = express.Router();
const {
  getAllPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  togglePlaylistFavorite,
  addStoryToPlaylist,
  removeStoryFromPlaylist
} = require('../controllers/playlistController');

// Base routes: /api/playlists
router.route('/')
  .get(getAllPlaylists)
  .post(createPlaylist);

// Routes with ID: /api/playlists/:id
router.route('/:id')
  .get(getPlaylist)
  .put(updatePlaylist)
  .delete(deletePlaylist);

// Action routes
router.patch('/:id/favorite', togglePlaylistFavorite);
router.patch('/:id/add-story', addStoryToPlaylist);
router.patch('/:id/remove-story', removeStoryFromPlaylist);

module.exports = router;