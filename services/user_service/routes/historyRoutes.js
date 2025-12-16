const express = require("express");
const historyController= require("../controllers/historyController");

const router = express.Router();

router.get("/user/:user_id", historyController.getHistoryByKid);

module.exports = router;
