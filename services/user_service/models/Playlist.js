const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a playlist name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  duration: {
    type: String,
    default: '0 min'
  },
  videos: {
    type: Number,
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total duration and video count
PlaylistSchema.methods.calculateStats = async function() {
  await this.populate('stories');
  this.videos = this.stories.length;
  
  // Calculate total duration (simple example)
  let totalMinutes = 0;
  this.stories.forEach(story => {
    const minutes = parseInt(story.duration);
    if (!isNaN(minutes)) totalMinutes += minutes;
  });
  
  this.duration = `${totalMinutes} min`;
  await this.save();
};

module.exports = mongoose.model('Playlist', PlaylistSchema);