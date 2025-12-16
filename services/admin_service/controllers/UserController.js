const express = require('express');
const app=express()
const PORT=3000;
const asyncHandler=require("express-async-handler")
app.use(express.json());
const bcrypt = require("bcrypt");

const sendmail=require('../services/sendMail')
const {addDaystodate}=require("./../services/userSerices")
const user=require("./../models/User")

const getAllUsers =asyncHandler(async (req, res) => {
  
        // Récupérer page et limit depuis les query params, par défaut page=1, limit=10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const fieldsToSelect = req.query.fields ? req.query.fields.split(',') : ['_id', 'user_name', 'email', 'phone', 'kids', 'payment_expires_date'];
        // Calculer le nombre de documents à sauter
        const skip = (page - 1) * limit;

        // Récupérer les utilisateurs avec pagination
        const users = await 
        user.find()
        .select(fieldsToSelect.join(' '))
        .skip(skip)
        .limit(limit);

        // Récupérer le nombre total d'utilisateurs pour info
        const totalUsers = await user.countDocuments();

        if (users.length === 0) {
        //    const err = new Error("Users not found");
        //     err.status = 404;
        //      throw err;
        console.log("aaaaaaaaaaaaaaaaaaaa");
        
    
        }

        return res.status(200).json({
            message: "Liste des utilisateurs",
            page: page,
            limit: limit,
            totalUsers: totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            users: users
        });

   
})

const getUserById=asyncHandler(async (req, res) => {
    const id=req.params.id
    if(!id){
        return res.status(400).json({message:"donner id "});
    }
     const userfound=await user.findById(id)
     if(!userfound)
        {const err = new Error("User not found");
        err.status = 404;
        throw err;
    } 
    else{
        return res.status(200).json({
            message:"utilisateur trouvé",
            user:userfound});
    }
})

const createUser=asyncHandler(async (req, res) => {
    console.log("bodyyyyyyyyyy");
    
    console.log("body",req.body);
    
    const saltRounds = 10; 
    const {username,email,password,role,phone,payment_type,region,amount,dateOfPayment}=req.body
    if (!req.file) {
            const err = new Error("image not found");
            err.status = 400;
            throw err; 
        }
    const newuser=new user({
        user_name:username,
        email:email,
        phone:phone,
        region:region,
        payment_expires_date:payment_type=="monthly"?addDaystodate(90,Date.now()):addDaystodate(365,Date.now()),
        password_hash : await bcrypt.hash(password, saltRounds),
        role:role,
        kids:[],
        payment_history:[
            {image:{
                data:req.file.buffer,
                contentType:req.file.mimetype
            },
            datePayment:dateOfPayment ? new Date(dateOfPayment) : new Date(),
            amount:parseFloat(amount),
            payment_type:  payment_type  
            }
        ]}) 
        const userSaved=await newuser.save()
        sendmail(newuser,password,"create")
        res.status(201).json({message:"user enregistrer!",user:userSaved});

   
});

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    
    if (!id) {
      return res.status(400).json({ message: "ID requis" });
    }
    
    if (!req.body) {
      return res.status(400).json({ message: "Données requises" });
    }
    
    const { email, username, phone, region, password, role } = req.body;
    
    // Créer un objet avec seulement les champs définis
    const updateData = {};
    
    if (username !== undefined) updateData.user_name = username;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (region !== undefined) updateData.region = region;
    if (role !== undefined) updateData.role = role;
    
    // ⭐ Gestion du mot de passe : seulement si fourni ET non vide
    if (typeof password === 'string' && password.trim() !== '') {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    // Si password est undefined, null, ou chaîne vide, on ne le touche pas
    
    console.log("Updating with data:", updateData);
    
    const userUpdated = await user.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!userUpdated) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    return res.status(200).json({
      message: "Modifié avec succès",
      user: userUpdated
    });
    
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      message: "Erreur: " + (err.message || "Erreur inconnue")
    });
  }
};
const getKidsByUser=asyncHandler(async (req, res) => {
    const id=req.params.id
    if (!id) {
    const err = new Error("id is required");
    err.status = 400;
    throw err; // ← envoie l’erreur au middleware handleError
  }
     const userfound=await user.findById(id)
     if(!userfound)
       {const err = new Error("User not found");
        err.status = 404;
        throw err;
    } 
    else{
        return res.status(200).json({
            message:"utilisateur trouvé",
            kids:userfound.kids});
    }
});
const updatePayment= asyncHandler(async (req,res)=>{
    const id=req.params.id;
    if(!id){
          const err = new Error("id not found");
        err.status = 404;
        throw err;
    }
    if(!req.body){

        const err = new Error("invalidinputs");
        err.status = 404;
        throw err;
    }
    if (!req.file) {
            const err = new Error("image not found");
            err.status = 400;
            throw err; 
        }       
        const existingUser = await user.findById(id);
          if (!existingUser) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
          
        const {amount,payment_type,dateOfPayment}=req.body;
          const currentExpiryDate = existingUser.payment_expires_date || new Date();
         newExerydate=payment_type=="Monthly"?addDaystodate(90,currentExpiryDate):addDaystodate(365,currentExpiryDate)
          const p={
            image: {
                data: req.file.buffer,   // image binaire
                contentType: req.file.mimetype
            },
            datePayment:new Date(dateOfPayment),
            payment_type:payment_type,
            amount:parseFloat(amount)

          }
          const userupdated=await user.findByIdAndUpdate(
             id,
            {payment_expires_date:newExerydate,
             $push: { payment_history: p }
            },
            {new:true});
         sendmail(userupdated,"payment")
          return res.status(201).json({message:"modifie avec succées:",user:userupdated});

       
    
})


 module.exports={
    getAllUsers,
    createUser,
    updateUser,
    getKidsByUser,
    getUserById,
    updatePayment
 }

