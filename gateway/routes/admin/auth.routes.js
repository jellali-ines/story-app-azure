const express = require('express');
const router = express.Router();
const asyncHandler = require("express-async-handler");
const axios = require('axios');

const AUTH_SERVICE_URL = `${process.env.ADMIN_SERVICE_URL}/api/admin`; // ex: http://localhost:3001

// ----------------------------
// Login
// ----------------------------
router.post("/login", asyncHandler(async (req, res) => {
    console.log(req.body);
    
    const response = await axios.post(`${AUTH_SERVICE_URL}/login`, req.body, {
        // headers: { "Content-Type": "application/json" }
    });

    return res.status(response.status).json(response.data);
}));

// ----------------------------
// Refresh Token
// ----------------------------
router.post("/refresh-token", asyncHandler(async (req, res) => {
    // forward cookie ou body selon comment le microservice Auth gère le refresh
    const response = await axios.post(`${AUTH_SERVICE_URL}/refreshToken`, req.body, {
        headers: {
            cookie: req.headers.cookie || "",  // forward le cookie
            "Content-Type": "application/json"
        }
    });

    return res.status(response.status).json(response.data);
}));

module.exports = router;
