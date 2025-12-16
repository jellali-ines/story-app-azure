const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  history_id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true, index: true },
  story_id: { type: String, required: true, index: true },
  read_date: { type: Date, default: Date.now },
  reading_progress: { type: Number, min: 0, max: 100 }, // % read
  completed: { type: Boolean, default: false },
  time_spent_minutes: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
  rating: { type: Number, min: 0, max: 5 },
  added_to_favorites: { type: Boolean, default: false },
  device_type: String // "mobile", "desktop", "tablet"
}, { timestamps: true , collection: "History" });

module.exports = mongoose.model("History", HistorySchema);