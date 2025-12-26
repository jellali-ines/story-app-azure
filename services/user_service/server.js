const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
// CORS - السماح لكل المصادر للتطوير
app.use(cors({
origin: "*"  // ← هذا يسمح للجميع بالوصول (للتجربة فقط)
}));


// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== ROUTES ====================
const foldersRoutes = require('./routes/folders');
const playlistsRoutes = require('./routes/playlists');
const userRoutes = require("./routes/userRoutes");
const genreRoutes = require("./routes/genreRoutes");
const storyRoutes = require("./routes/storyRoutes");
const historyRoutes = require("./routes/historyRoutes");
const authRoutes = require("./routes/authRouters");

app.use("/api/folders", foldersRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ==================== MONGO ====================
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