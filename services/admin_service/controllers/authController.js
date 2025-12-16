const express = require('express');
const app=express()
const PORT=3000;
const asyncHandler=require("express-async-handler")
const jwt =require('jsonwebtoken');

app.use(express.json());
const {verify_password}=require("./../services/userSerices")
const user=require("./../models/User")
const login=asyncHandler(async(req,res)=>{
    const{login,pwd}=req.body
    const userFound=await user.findOne({email:login})
    if(!userFound){
         const err = new Error("user not found");
            err.status = 404;
            throw err; 
    }
    console.log(userFound);
    const result=await verify_password(pwd,userFound.password_hash)
    if(!result){
        const err = new Error("Verify your password ");
            err.status = 401;
            throw err; 
    }

const payload = { id: userFound._id, email: userFound.email, role: userFound.role};
const secret = process.env.JWT_SECRET;

const token = jwt.sign(payload, secret, {
  expiresIn: '15m'
});
const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

  // Stocker le refresh token dans HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,      
    //secure: false,
    //sameSite: 'Lax',  // protection CSRF
    //maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en ms
  });

return res.status(200).json({
        message: "Connexion réussie",
        user:userFound,
        token: token
    });
})

const refreshTokenHandler=asyncHandler(async(req, res) =>{

  const token = req.cookies?.refreshToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }

    const newAccessToken = jwt.sign(
      {id: decoded._id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // A new refresh token will also be generated here if using rotation

    return res.json({ accessToken: newAccessToken });
  });
})




module.exports={
   login,refreshTokenHandler
 }