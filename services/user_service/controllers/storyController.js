const Story = require("../models/Story");

// Simple wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all stories with pagination
// @route   GET /api/stories?page=1&limit=10
// @access  Public
const getAllStories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalStories = await Story.countDocuments();
  const stories = await Story.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    page,
    limit,
    totalStories,
    totalPages: Math.ceil(totalStories / limit),
    stories
  });
});

// @desc    Get one story by ID
// @route   GET /api/stories/:id OR /api/stories/:storyId
// @access  Public
const getStoryById = asyncHandler(async (req, res) => {
  const storyId = req.params.id || req.params.storyId;
  
  console.log('🔍 Looking for story with ID:', storyId);
  
  let story = null;
  
  // جرّب story_id أولاً (لو رقم)
  if (!isNaN(storyId)) {
    story = await Story.findOne({ story_id: Number(storyId) });
    if (story) {
      console.log('✅ Story found by story_id:', story.title);
      return res.json(story);
    }
  }
  
  // جرّب MongoDB _id
  try {
    story = await Story.findById(storyId);
    if (story) {
      console.log('✅ Story found by _id:', story.title);
      return res.json(story);
    }
  } catch (err) {
    console.log('⚠️ Not a valid MongoDB ID');
  }
  
  // مالقيتش
  console.log('❌ Story not found with ID:', storyId);
  res.status(404);
  throw new Error("Story non trouvée");
});

// @desc    Search stories
// @route   GET /api/stories/search?q=keyword
// @access  Public
const searchStories = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    res.status(400);
    throw new Error("Search query is required");
  }

  const stories = await Story.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { tags: { $in: [q] } },
      { genre: { $regex: q, $options: "i" } }
    ]
  });

  res.json({
    count: stories.length,
    stories
  });
});

// @desc    Get popular stories
// @route   GET /api/stories/popular
// @access  Public
const getPopularStories = asyncHandler(async (req, res) => {
  const stories = await Story.find()
    .sort({ likes: -1, views: -1 })
    .limit(10);

  res.json({
    count: stories.length,
    stories
  });
});

// @desc    Toggle favorite story
// @route   PATCH /api/stories/:id/favorite
// @access  Public
const toggleFavoriteStory = asyncHandler(async (req, res) => {
  const storyId = req.params.id;
  let story = null;
  
  // جرّب story_id
  if (!isNaN(storyId)) {
    story = await Story.findOne({ story_id: Number(storyId) });
  }
  
  // جرّب _id
  if (!story) {
    try {
      story = await Story.findById(storyId);
    } catch (err) {}
  }
  
  if (!story) {
    res.status(404);
    throw new Error('Story non trouvée');
  }
  
  story.isFavorite = !story.isFavorite;
  await story.save();
  
  res.json(story);
});

// @desc    Increment story views/plays
// @route   PATCH /api/stories/:id/play
// @access  Public
const incrementStoryViews = asyncHandler(async (req, res) => {
  const storyId = req.params.id;
  let story = null;
  
  // جرّب story_id
  if (!isNaN(storyId)) {
    story = await Story.findOne({ story_id: Number(storyId) });
  }
  
  // جرّب _id
  if (!story) {
    try {
      story = await Story.findById(storyId);
    } catch (err) {}
  }
  
  if (!story) {
    res.status(404);
    throw new Error('Story non trouvée');
  }
  
  story.views += 1;
  await story.save();
  
  res.json(story);
});

// @desc    Increment story likes
// @route   PATCH /api/stories/:id/like
// @access  Public
const likeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  let story = null;
  
  // جرّب story_id
  if (!isNaN(storyId)) {
    story = await Story.findOne({ story_id: Number(storyId) });
  }
  
  // جرّب _id
  if (!story) {
    try {
      story = await Story.findById(storyId);
    } catch (err) {}
  }
  
  if (!story) {
    res.status(404);
    throw new Error('Story non trouvée');
  }
  
  story.likes += 1;
  await story.save();
  
  res.json(story);
});

// @desc    Mark story as read
// @route   POST /api/stories/users/:userId/kids/:index/read/:storyId
// @access  Public
const readStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  let story = null;
  
  // جرّب story_id
  if (!isNaN(storyId)) {
    story = await Story.findOne({ story_id: Number(storyId) });
  }
  
  // جرّب _id
  if (!story) {
    try {
      story = await Story.findById(storyId);
    } catch (err) {}
  }
  
  if (!story) {
    res.status(404);
    throw new Error('Story non trouvée');
  }
  
  story.views += 1;
  await story.save();
  
  res.json(story);
});

// @desc    Mark story as complete
// @route   POST /api/stories/users/:userId/kids/:index/complete/:storyId
// @access  Public
const completeStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  let story = null;
  
  // جرّب story_id
  if (!isNaN(storyId)) {
    story = await Story.findOne({ story_id: Number(storyId) });
  }
  
  // جرّب _id
  if (!story) {
    try {
      story = await Story.findById(storyId);
    } catch (err) {}
  }
  
  if (!story) {
    res.status(404);
    throw new Error('Story non trouvée');
  }
  
  res.json(story);
});

module.exports = { 
  getAllStories, 
  getStoryById, 
  searchStories, 
  getPopularStories,
  toggleFavoriteStory,
  incrementStoryViews,
  likeStory,
  readStory,
  completeStory
};