const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('./models/Story');
const Folder = require('./models/Folder');
const Playlist = require('./models/Playlist');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await Story.deleteMany();
    await Folder.deleteMany();
    await Playlist.deleteMany();
    
    console.log('🗑️  Data cleared');

    // Create Stories
    const stories = await Story.create([
      {
        title: 'Lily and the Star-Bright Dragon',
        description: 'Little Lily lived in a cozy cottage at the edge of a forest where the trees sang gentle lullabies every evening...',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
        duration: '3 min'
      },
      {
        title: 'The Dragon Egg',
        description: 'In a hidden cave, a mysterious egg begins to glow...',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
        duration: '4 min'
      },
      {
        title: 'Fire and Ice',
        description: 'Two dragons from different worlds meet for the first time...',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop',
        duration: '3 min'
      }
    ]);

    console.log('✅ Stories created');

    // Create Folders
    const folders = await Folder.create([
      {
        name: 'New Playlist',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        playlistCount: 0
      },
      {
        name: "Bob's playlist",
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        playlistCount: 0
      }
    ]);

    console.log('✅ Folders created');

    // Create Playlists
    const playlists = await Playlist.create([
      {
        name: 'Dragon Tales',
        description: 'Magical dragon adventures for bedtime',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
        folderId: folders[0]._id,
        stories: [stories[0]._id, stories[1]._id, stories[2]._id],
        duration: '10 min',
        videos: 3,
        isFavorite: true
      },
      {
        name: 'Fairy Stories',
        description: 'Enchanting fairy tales',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        folderId: folders[0]._id,
        stories: [],
        duration: '12 min',
        videos: 3,
        isFavorite: false
      }
    ]);

    console.log('✅ Playlists created');

    // Update folder playlist counts
    await folders[0].updatePlaylistCount();
    await folders[1].updatePlaylistCount();

    console.log('✅ Folder counts updated');
    console.log('🎉 Seed data completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

// Run
connectDB().then(() => seedData());