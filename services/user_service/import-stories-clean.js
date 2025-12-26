const mongoose = require('mongoose');
const fs = require('fs');
const Story = require('./models/Story');

const MONGO_URI = "mongodb+srv://admin:BM0a7A1cwkcopozO@cluster0.l3awpvu.mongodb.net/AppStories";

async function importStories() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const rawData = JSON.parse(fs.readFileSync('../../Story.json', 'utf8'));
    console.log(`📚 Found ${rawData.length} stories in file`);

    // تنظيف البيانات - إزالة _id و $oid
    const cleanData = rawData.map(story => {
      const { _id, ...cleanStory } = story;
      return cleanStory;
    });

    // حذف البيانات القديمة
    await Story.deleteMany({});
    console.log('🗑️  Cleared old data');

    // استيراد البيانات
    const result = await Story.insertMany(cleanData, { ordered: false });
    console.log(`✅ Successfully imported ${result.length} stories!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.writeErrors) {
      console.log(`⚠️  Imported ${error.insertedDocs?.length || 0} stories before error`);
    }
    process.exit(1);
  }
}

importStories();
