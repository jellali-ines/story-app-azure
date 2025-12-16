const asyncHandler = require('../middleware/asyncHandler');
const Folder = require('../models/Folder');
const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// @desc    Get all folders
// @route   GET /api/folders
// @access  Public
exports.getAllFolders = asyncHandler(async (req, res) => {
  const folders = await Folder.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: folders.length,
    data: folders
  });
});

// @desc    Get single folder
// @route   GET /api/folders/:id
// @access  Public
exports.getFolder = asyncHandler(async (req, res) => {
  // Validation de l'ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Format d\'ID de dossier invalide');
  }

  const folder = await Folder.findById(req.params.id);
  
  if (!folder) {
    res.status(404);
    throw new Error('Dossier non trouvé');
  }
  
  // Récupérer les playlists de ce dossier
  const playlists = await Playlist.find({ folderId: folder._id });
  
  res.status(200).json({
    success: true,
    data: {
      folder,
      playlists: playlists || []
    }
  });
});

// @desc    Create new folder
// @route   POST /api/folders
// @access  Public
exports.createFolder = asyncHandler(async (req, res) => {
  // Validation manuelle
  const { name } = req.body;
  
  if (!name || name.trim().length === 0) {
    res.status(400);
    throw new Error('Le nom du dossier est requis');
  }

  if (name.length > 50) {
    res.status(400);
    throw new Error('Le nom ne peut pas dépasser 50 caractères');
  }

  const folder = await Folder.create({
    name: name.trim(),
    image: req.body.image || null
  });
  
  res.status(201).json({
    success: true,
    data: folder
  });
});

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Public
exports.updateFolder = asyncHandler(async (req, res) => {
  // Validation de l'ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Format d\'ID de dossier invalide');
  }

  // Validation des données
  if (req.body.name && req.body.name.length > 50) {
    res.status(400);
    throw new Error('Le nom ne peut pas dépasser 50 caractères');
  }

  const folder = await Folder.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!folder) {
    res.status(404);
    throw new Error('Dossier non trouvé');
  }
  
  res.status(200).json({
    success: true,
    data: folder
  });
});

// @desc    Delete folder
// @route   DELETE /api/folders/:id
// @access  Public
exports.deleteFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validation de l'ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Format d\'ID de dossier invalide');
  }

  const folder = await Folder.findById(id);
  
  if (!folder) {
    res.status(404);
    throw new Error('Dossier non trouvé');
  }
  
  // Supprimer toutes les playlists de ce dossier
  await Playlist.deleteMany({ folderId: folder._id });
  
  await folder.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Dossier et playlists associées supprimés',
    data: {}
  });
});