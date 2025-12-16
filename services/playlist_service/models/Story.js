const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  duration: {
    type: String,
    required: [true, 'Please add duration'],
    default: '3 min'
  },
  audioUrl: {
    type: String,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  playCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Story', StorySchema);