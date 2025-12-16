const express = require('express');
const router = express.Router();
const {
  getAllPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  togglePlaylistFavorite,  // CHANGÉ : toggleFavorite → togglePlaylistFavorite
  addStoryToPlaylist,
  removeStoryFromPlaylist   // AJOUTÉ
} = require('../controllers/playlistController');

// Routes pour les playlists
router.route('/')
  .get(getAllPlaylists)
  .post(createPlaylist);

router.route('/:id')
  .get(getPlaylist)
  .put(updatePlaylist)
  .delete(deletePlaylist);

// Correction des routes PATCH
router.patch('/:id/favorite', togglePlaylistFavorite);  // toggleFavorite → togglePlaylistFavorite
router.patch('/:id/add-story', addStoryToPlaylist);     // POST → PATCH et /stories → /add-story
router.patch('/:id/remove-story', removeStoryFromPlaylist); // AJOUTÉ

module.exports = router;