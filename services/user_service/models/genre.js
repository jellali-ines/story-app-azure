const mongoose = require("mongoose");

const GenreSchema = new mongoose.Schema({
  genre_id: { type: Number, required: true, unique: true },
  genre_name: { type: String, required: true, index: true },
  storyIds: [
    {
      type: Number,     // ID personnalisé des stories
      ref: "Story"      // relation vers Story
    }
  ]
}, { timestamps: true , collection: "Genre" });

module.exports = mongoose.model("Genre", GenreSchema);
