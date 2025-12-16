const express = require('express');
const app=express()
const PORT=3000;

const genre=require("./../models/Genre")

async function deleteGenre(id){
  genredeleted=await genre.findOneAndDelete({genre_id:id})
  return genredeleted
}
module.exports={deleteGenre}