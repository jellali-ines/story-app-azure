const mongoose = require('mongoose');
const fs = require('fs');
const Story = require('./models/Story');

const MONGO_URI = "mongodb+srv://admin:BM0a7A1cwkcopozO@cluster0.l3awpvu.mongodb.net/AppStories";

async function importStories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // قراءة Story.json من المجلد الرئيسي
    const filePath = '../../Story.json';
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📚 Found ${data.length} stories`);

    // حذف البيانات القديمة
    await Story.deleteMany({});
    console.log('🗑️  Cleared old data');

    // استيراد البيانات الجديدة
    await Story.insertMany(data);
    console.log(`✅ Successfully imported ${data.length} stories!`);

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

importStories();
