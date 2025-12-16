const asyncHandler = require('../middleware/asyncHandler');
const Story = require('../models/Story');

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
exports.getAllStories = asyncHandler(async (req, res) => {
  const stories = await Story.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: stories.length,
    data: stories
  });
});

// @desc    Get single story
// @route   GET /api/stories/:id
// @access  Public
exports.getStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  
  if (!story) {
    res.status(404);
    throw new Error('Histoire non trouvée');
  }
  
  res.status(200).json({
    success: true,
    data: story
  });
});

// @desc    Create new story
// @route   POST /api/stories
// @access  Public
exports.createStory = asyncHandler(async (req, res) => {
  const { title, description, image, duration } = req.body;
  
  // Validation manuelle
  if (!title || title.trim().length === 0) {
    res.status(400);
    throw new Error('Le titre est requis');
  }

  if (!description || description.trim().length === 0) {
    res.status(400);
    throw new Error('La description est requise');
  }

  if (!image || image.trim().length === 0) {
    res.status(400);
    throw new Error('L\'image est requise');
  }

  if (title.length > 100) {
    res.status(400);
    throw new Error('Le titre ne peut pas dépasser 100 caractères');
  }

  if (description.length > 2000) {
    res.status(400);
    throw new Error('La description ne peut pas dépasser 2000 caractères');
  }

  const story = await Story.create({
    title: title.trim(),
    description: description.trim(),
    image: image.trim(),
    duration: duration || '3 min',
    audioUrl: req.body.audioUrl || null
  });
  
  res.status(201).json({
    success: true,
    data: story
  });
});

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Public
exports.updateStory = asyncHandler(async (req, res) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!story) {
    res.status(404);
    throw new Error('Histoire non trouvée');
  }
  
  res.status(200).json({
    success: true,
    data: story
  });
});

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Public
exports.deleteStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  
  if (!story) {
    res.status(404);
    throw new Error('Histoire non trouvée');
  }
  
  await story.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Histoire supprimée',
    data: {}
  });
});

// @desc    Toggle story favorite
// @route   PATCH /api/stories/:id/favorite
// @access  Public
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  
  if (!story) {
    res.status(404);
    throw new Error('Histoire non trouvée');
  }
  
  story.isFavorite = !story.isFavorite;
  await story.save();
  
  res.status(200).json({
    success: true,
    data: story
  });
});

// @desc    Increment play count
// @route   PATCH /api/stories/:id/play
// @access  Public
exports.incrementPlayCount = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id);
  
  if (!story) {
    res.status(404);
    throw new Error('Histoire non trouvée');
  }
  
  story.playCount += 1;
  await story.save();
  
  res.status(200).json({
    success: true,
    data: story
  });
});