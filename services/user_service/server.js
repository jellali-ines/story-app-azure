const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

// ==================== INIT APP ====================
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

// ==================== IMPORT ROUTES ====================
let foldersRoutes, playlistsRoutes;

try {
  foldersRoutes = require('./routes/folders');
  console.log("✅ Folders routes loaded");
  console.log("🔍 Type:", typeof foldersRoutes);
} catch (err) {
  console.error("❌ Error loading folders routes:", err.message);
  console.error("❌ Full error:", err);
}

try {
  playlistsRoutes = require('./routes/playlists');
  console.log("✅ Playlists routes loaded");
} catch (err) {
  console.error("❌ Error loading playlists routes:", err.message);
}

// Other routes
const userRoutes = require("./routes/userRoutes");
const genreRoutes = require("./routes/genreRoutes");
const storyRoutes = require("./routes/storyRoutes");
const historyRoutes = require("./routes/historyRoutes");
const authRoutes = require("./routes/authRouters");

// ==================== REGISTER ROUTES ====================
if (foldersRoutes) {
  app.use("/api/folders", foldersRoutes);
  console.log("📁 /api/folders registered");
} else {
  console.log("⚠️ foldersRoutes is null or undefined!");
}

if (playlistsRoutes) {
  app.use("/api/playlists", playlistsRoutes);
  console.log("🎵 /api/playlists registered");
}

app.use("/api/genres", genreRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

// 🧪 Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ==================== MONGO CONNECTION ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur MongoDB:", err));

// ==================== ERROR MIDDLEWARE ====================
app.use(notFound);
app.use(errorHandler);

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));