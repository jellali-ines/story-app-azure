const express = require('express');
const app=express()
const PORT=3000;
const bcrypt = require("bcrypt");

app.use(express.json());


function addDaystodate(days, date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

async function verify_password(password,hash_password){
  console.log(hash_password);
  console.log(password);
  
  
   return await bcrypt.compare(password, hash_password);
}

module.exports={
    addDaystodate,
    verify_password
}