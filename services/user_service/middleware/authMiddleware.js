const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dotenv = require("dotenv");
dotenv.config();
// Clé secrète JWT (à mettre dans .env)
const JWT_SECRET = process.env.JWT_SECRET ;

/* ======================================================
   AUTH: Vérifie que l'utilisateur est connecté
====================================================== */
const protect = async (req, res, next) => {
  let token;

  // 1️⃣ Vérifier cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ Vérifier Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error("Accès refusé : Token manquant"));
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer utilisateur
    req.user = await User.findById(decoded.id).select("-password_hash");

    if (!req.user) {
      res.status(401);
      return next(new Error("Utilisateur non trouvé"));
    }

    next();

  } catch (err) {
  return res.status(401).json({ message: "Token invalide ou expiré", error_type: "Error" });
}
};

exports = module.exports = { protect };