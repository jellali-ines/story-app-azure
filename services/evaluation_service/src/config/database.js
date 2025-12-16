
// ========================== DATABASE CONFIGURATION ==========================
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grammar-fun';

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// ========================== CONNECT DATABASE ==========================
const connectDatabase = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// ========================== DISCONNECT DATABASE ==========================
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error.message);
    throw error;
  }
};

// ========================== CONNECTION EVENTS ==========================
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Close connection on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = {
  connectDatabase,
  disconnectDatabase,
  mongoose
};