const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreController");

// GET all genres
router.get("/", genreController.getAllGenres);

// GET stories by genre (using _id)
router.get("/:genreId/stories", genreController.getStoriesByGenre);
///api/genres/692e1c9925842985be6da1c1/stories

module.exports = router;
