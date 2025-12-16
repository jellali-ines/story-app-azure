const History = require("../models/history");


// ✅ GET history by Kid
const getHistoryByKid = async (req, res) => {
  try {
    const userHistory = await History.find({ user_id: req.params.user_id });
    res.status(200).json(userHistory);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

module.exports = { getHistoryByKid };
