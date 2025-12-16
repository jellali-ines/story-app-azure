
const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require("form-data");

const PAYMENT_SERVICE = process.env.PAYMENT_SERVICE_URL;
const upload =require("../../middleware/upload"); 

router.post("/info", upload.single("image"), async (req, res) => {
  try {
    const form = new FormData();

    form.append("image", req.file.buffer, {
      filename: req.file.originalname,
    });

    // Appel au microservice Flask
    const response = await axios.post(`${PAYMENT_SERVICE}/payment`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    res.json({
      message: "Image envoyée au payment-service",
      data: response.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'appel à /payment" });
  }
});

module.exports = router;
