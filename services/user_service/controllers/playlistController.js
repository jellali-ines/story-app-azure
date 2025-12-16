const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// Simple wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all playlists
// @route   GET /api/playlists
// @access  Public
exports.getAllPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: playlists });
});

// @desc    Get single playlist
// @route   GET /api/playlists/:id
// @access  Public
exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  res.status(200).json({ success: true, data: playlist });
});

// @desc    Create playlist
// @route   POST /api/playlists
// @access  Public
exports.createPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.create(req.body);
  res.status(201).json({ success: true, data: playlist });
});

// @desc    Update playlist
// @route   PUT /api/playlists/:id
// @access  Public
exports.updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  res.status(200).json({ success: true, data: playlist });
});

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Public
exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  await playlist.deleteOne();
  res.status(200).json({ success: true, message: 'Playlist supprimée' });
});

// @desc    Toggle playlist favorite
// @route   PATCH /api/playlists/:id/favorite
// @access  Public
exports.togglePlaylistFavorite = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  playlist.isFavorite = !playlist.isFavorite;
  await playlist.save();
  res.status(200).json({ success: true, data: playlist });
});

// @desc    Add story to playlist
// @route   PATCH /api/playlists/:id/add-story
// @access  Public
exports.addStoryToPlaylist = asyncHandler(async (req, res) => {
  const { storyId } = req.body;
  if (!storyId) {
    res.status(400);
    throw new Error('ID de l\'histoire requis');
  }
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  playlist.stories.push(storyId);
  await playlist.save();
  res.status(200).json({ success: true, data: playlist });
});

// @desc    Remove story from playlist
// @route   PATCH /api/playlists/:id/remove-story
// @access  Public
exports.removeStoryFromPlaylist = asyncHandler(async (req, res) => {
  const { storyId } = req.body;
  if (!storyId) {
    res.status(400);
    throw new Error('ID de l\'histoire requis');
  }
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  const index = playlist.stories.indexOf(storyId);
  if (index > -1) {
    playlist.stories.splice(index, 1);
  }
  await playlist.save();
  res.status(200).json({ success: true, data: playlist });
});