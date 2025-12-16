// controllers/playlistController.js
const asyncHandler = require('../middleware/asyncHandler');
const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// Fonctions de base (assurez-vous d'avoir au moins celles-ci)
exports.getAllPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: playlists });
});

exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  res.status(200).json({ success: true, data: playlist });
});

exports.createPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.create(req.body);
  res.status(201).json({ success: true, data: playlist });
});

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

exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    res.status(404);
    throw new Error('Playlist non trouvée');
  }
  await playlist.deleteOne();
  res.status(200).json({ success: true, message: 'Playlist supprimée' });
});

// AJOUTEZ CES FONCTIONS SI ELLES MANQUENT :

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