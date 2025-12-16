const { text } = require("express");
const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  story_id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genre: String,
  tags: [String],
  reading_time: String,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  text: String,
  reading_time:Number,
  author:{
    type:String,
    required:true
  },
  language:String,
  Recommended_age:String,
  questions: [String],

  image_url: String,
  transcript: [
    { text: String, start: Number , end: Number }
  ],
  genresIds: [
    {
      type: Number,     // ID personnalisé des genres
      ref: "Genre"      // relation vers genre
    }
  ],
   image: {
    data: Buffer,
    mimetype: String,
    filename: String
},
audio: {
  url: String,
  filename: String
}
}, { timestamps: true, collection: "Story" }); // ✅ tout dans un seul objet

module.exports = mongoose.model("Story", storySchema);

