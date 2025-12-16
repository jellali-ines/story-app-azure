const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  story_id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  genre: String,
  tags: [String],
  reading_time: String,
  views: { 
    type: Number, 
    default: 0 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  isFavorite: { 
    type: Boolean, 
    default: false 
  },
  text: String,
  questions: [String],
  url: String,
  image_url: String,
  transcript: [
    { 
      text: String, 
      start: Number, 
      end: Number 
    }
  ],
  genreIds: [
    {
      type: Number,
      ref: "Genre"
    }
  ]
}, { 
  timestamps: true, 
  collection: "Story" 
}); 

module.exports = mongoose.models.Story || mongoose.model("Story", storySchema);
