const Genre = require("../models/genre");
const Story = require("../models/story");

// ========================
// GET ALL GENRES
// ========================
const getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find().select("-__v");
    res.status(200).json(genres);
  } catch (error) {
    console.error("Error getting genres:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// GET STORIES BY GENRE ID
// ========================
const getStoriesByGenre = async (req, res) => {
  try {
    const { genreId } = req.params; // this is the MongoDB _id

    // Check if genre exists
    const genre = await Genre.findById(genreId);
    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    // Fetch stories based on storyIds list
    const stories = await Story.find({ story_id: { $in: genre.storyIds } });

    res.status(200).json({
      genre: genre.genre_name,
      totalStories: stories.length,
      stories,
    });
  } catch (error) {
    console.error("Error getting stories by genre:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllGenres,
  getStoriesByGenre,
};
