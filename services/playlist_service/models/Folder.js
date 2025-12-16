const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a folder name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  image: {
    type: String,
    default: null
  },
  playlistCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update playlistCount when playlists are added/removed
FolderSchema.methods.updatePlaylistCount = async function() {
  const Playlist = mongoose.model('Playlist');
  const count = await Playlist.countDocuments({ folderId: this._id });
  this.playlistCount = count;
  await this.save();
};

module.exports = mongoose.model('Folder', FolderSchema);