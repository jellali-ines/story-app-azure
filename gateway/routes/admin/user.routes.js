
const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require("form-data");
const asyncHandler = require("express-async-handler");

const USER_SERVICE = process.env.ADMIN_SERVICE_URL;
const upload =require("../../middleware/upload"); 

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log("tokeeeeeeeeeeeeeeeeeeeeeeeen",token);
    
    const form = new FormData();

    form.append("image", req.file.buffer, {
      filename: req.file.originalname,
    });
   
   form.append( "username",req.body.username)
    form.append("email",req.body.email)
    form.append("password",req.body.password)
    form.append("role",req.body.role)
    form.append("phone",req.body.phone)
    form.append("payment_type",req.body.payment_type)
    form.append("region",req.body.region)
    form.append("amount",req.body.amount)
    form.append("dateOfPayment", req.body.dateOfPayment)
    // Appel au microservice Flask
    
    const response = await axios.post(`${USER_SERVICE}/api/admin/user/add`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization:token
      },
    });

    res.json({
      message: "Image envoyée au payment-service",
      data: response.data,
    });
  } catch (error) {
    console.error(error);
    if (error.response) {
      // error.response.data contient le message envoyé par Flask
      res.status(error.response.status).json({
        error_from_service: error.response.data,
      });
    } else {
      // Erreur réseau ou autre
      res.status(500).json({ error: "Erreur interne à l'API Gateway", details: error.message });
    }
  }
});


router.get("/users", asyncHandler(async (req, res) => {
  const token = req.headers.authorization;

  const response = await axios.get(`${USER_SERVICE}/api/admin/users`, {
    params: req.query,       // query params pour pagination, filtres, etc.
    headers: { Authorization: token }  // token envoyé au service
  });
  console.log(response.data);
  
  res.json(response.data);
}));


// 2️⃣ Get user by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const token = req.headers.authorization;

  const response = await axios.get(`${USER_SERVICE}/api/admin/user/${req.params.id}`,{
           // query params pour pagination, filtres, etc.
    headers: { Authorization: token }});
  res.json(response.data);
}));

// 3️⃣ Get kids by user ID
router.get("/:id/kids", asyncHandler(async (req, res) => {
      const token = req.headers.authorization;

  const response = await axios.get(`${USER_SERVICE}/api/admin/user/${req.params.id}/kids`,
   {  headers: { Authorization: token }}
  );
  res.json(response.data);
}));

// 4️⃣ Update user
router.put("/:id/update", asyncHandler(async (req, res) => {
  const token = req.headers.authorization;

  const response = await axios.put(
    `${USER_SERVICE}/api/admin/${req.params.id}/updateUser`,
    req.body,  // corps de la requête
    {
      headers: {
        Authorization: token  // token dans le header
      }
    }
  );

  res.json(response.data);
}));


// 5️⃣ Update payment (upload image + champs)
router.put("/:id/payment", upload.single("image"), asyncHandler(async (req, res) => {
    const token = req.headers.authorization;

  const formData = new FormData();
  
  // Ajouter le fichier si présent
  if (req.file) {
    formData.append("image", req.file.buffer, { filename: req.file.originalname });
  }

  // Ajouter les champs du body
  Object.keys(req.body).forEach(key => {
    formData.append(key, req.body[key]);
  });

  const response = await axios.put(`${USER_SERVICE}/api/admin/${req.params.id}/updatePayment`, formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: token, // si tu passes un token
    },
  });

  res.json(response.data);
}));

module.exports = router;
