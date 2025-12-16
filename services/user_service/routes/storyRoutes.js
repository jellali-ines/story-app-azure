const express = require("express");
const storyController = require("../controllers/storyController");

const router = express.Router();

// Routes spéciales (doivent être AVANT les routes dynamiques)
router.get("/search", storyController.searchStories);
router.get("/popular", storyController.getPopularStories);

// ✅ FIXED: Changed :storyId to :id for consistency
router.patch("/:id/favorite", storyController.toggleFavoriteStory);

// Lire / liker
router.post("/users/:userId/kids/:index/read/:storyId", storyController.readStory);
router.post("/users/:userId/kids/:index/like/:storyId", storyController.likeStory);
router.post("/users/:userId/kids/:index/complete/:storyId", storyController.completeStory);

// Toutes les stories
router.get("/", storyController.getAllStories);

// ❗ Doit être DERNIÈRE route - Also changed to :id
router.get("/:id", storyController.getStoryById);

module.exports = router;