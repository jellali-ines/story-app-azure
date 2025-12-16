const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// Clé secrète JWT (à mettre dans .env)
const JWT_SECRET = process.env.JWT_SECRET ;

exports.registerUser = async (req, res) => {
  try {
    const { user_name, phone, region, email, password } = req.body;

    if (!user_name || !phone || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Vérifier si email existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash mot de passe
    const password_hash = await bcrypt.hash(password, 10);

    const user = new User({
      user_name,
      phone,
      region,
      email,
      password_hash,
      role: "parent"
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        user_name: user.user_name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
};



exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // send token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,  // mettre true en production HTTPS
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: "Login successful",
      token,  // <--- Ajouté
      user: {
        id: user._id,
        user_name: user.user_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};



exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({
      message: "Logout failed",
      error: err.message
    });
  }
};
