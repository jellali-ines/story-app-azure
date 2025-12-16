const User = require("../models/user");
const asyncHandler = require("../middleware/asyncHandler");




// ✅ GET one user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

const createKidProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, age, avatar } = req.body;

    if (!name || !age) {
      return res.status(400).json({ message: "Name and age are required" });
    }

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newKid = {
      name,
      age,
      avatar,
      preferred_genres: [],
      preferred_characters: [],
      preferred_emotions: [],
      preferred_reading_time:[],
      total_likes: 0,
      total_completed: 0,
      total_stories_read: 0,
      total_reading_time_minutes: 0,
      avatar: avatar || null,
    };

    user.kids.push(newKid);
    await user.save();

    return res.status(201).json({ message: "Kid created successfully", kid: newKid });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating kid", error: err.message });
  }
};

const setKidPreferences = asyncHandler(async (req, res) => {
  const { userId, kidId } = req.params;

  if (req.user._id.toString() !== userId) {
    res.status(403);
    throw new Error("Accès interdit : ce n'est pas votre profil");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const kid = user.kids.id(kidId);
  if (!kid) {
    res.status(404);
    throw new Error("Kid not found");
  }

  const {
    preferred_genres,
    preferred_characters,
    preferred_emotions,
    preferred_reading_time
  } = req.body;

  if (preferred_genres) kid.preferred_genres = preferred_genres;
  if (preferred_characters) kid.preferred_characters = preferred_characters;
  if (preferred_emotions) kid.preferred_emotions = preferred_emotions;
  if (preferred_reading_time) kid.preferred_reading_time = preferred_reading_time;

  await user.save();

  res.status(200).json({
    message: "Preferences updated successfully",
    kid
  });
});



const getKids = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("kids");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (req.user._id.toString() !== userId) {
    res.status(403);
    throw new Error("Accès interdit");
  }

  res.json({ kids: user.kids });
});

const getKidById = async (req, res) => {
  try {
    const { userId, kidId } = req.params;

    // Récupérer seulement le champ kids
    const user = await User.findById(userId).select("kids");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Chercher le kid par _id
    const kid = user.kids.id(kidId); // méthode mongoose pour sous-documents
    if (!kid) return res.status(404).json({ message: "Kid not found" });

    res.json({ kid });

  } catch (err) {
    res.status(500).json({ message: "Error fetching kid", error: err.message });
  }
};


module.exports = {  getUserById, getKids, setKidPreferences, createKidProfile, getKidById };
