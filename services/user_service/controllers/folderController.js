const Folder = require('../models/Folder');
const Playlist = require('../models/Playlist');
const mongoose = require('mongoose');

// Simple wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all folders
// @route   GET /api/folders
// @access  Public
exports.getAllFolders = asyncHandler(async (req, res) => {
  console.log('✅ getAllFolders called');
  
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
  console.log('✅ getFolder called for ID:', req.params.id);
  
  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Format d\'ID de dossier invalide');
  }

  const folder = await Folder.findById(req.params.id);
  
  if (!folder) {
    res.status(404);
    throw new Error('Dossier non trouvé');
  }
  
  // Get playlists for this folder
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
  console.log('✅ createFolder called with body:', req.body);
  
  // Manual validation
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
    image: req.body.image || null,
    playlistCount: 0
  });
  
  console.log('✅ Folder created:', folder);
  
  res.status(201).json({
    success: true,
    data: folder
  });
});

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Public
exports.updateFolder = asyncHandler(async (req, res) => {
  console.log('✅ updateFolder called for ID:', req.params.id);
  
  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Format d\'ID de dossier invalide');
  }

  // Validate data
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
  console.log('✅ deleteFolder called for ID:', req.params.id);
  
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Format d\'ID de dossier invalide');
  }

  const folder = await Folder.findById(id);
  
  if (!folder) {
    res.status(404);
    throw new Error('Dossier non trouvé');
  }
  
  // Delete all playlists in this folder
  await Playlist.deleteMany({ folderId: folder._id });
  
  await folder.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Dossier et playlists associées supprimés',
    data: {}
  });
});