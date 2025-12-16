const express = require("express");
const kidController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id", protect, kidController.getUserById);
router.post("/:userId/kids", protect, kidController.createKidProfile);
router.put("/:userId/kids/:kidId/preferences", protect, kidController.setKidPreferences);
router.get("/:userId/kids", protect, kidController.getKids);
router.get("/:userId/kid/:kidId", protect, kidController.getKidById);


module.exports = router;
