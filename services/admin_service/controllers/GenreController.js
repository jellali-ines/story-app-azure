const express = require('express');
const app=express()
const asyncHandler=require("express-async-handler")
app.use(express.json());

const genre=require("./../models/Genre")
const story=require("./../models/Story")
const getAllGenres =asyncHandler(async (req, res) => {
         
        // Récupérer les utilisateurs avec pagination
        const genres = await genre.find();

        // Récupérer le nombre total d'utilisateurs pour info
        const totalGenres = await genre.countDocuments();
        return res.status(200).json({
            message: "genres list",
           
            totalGenres: totalGenres,
            genres: genres
        });

   
})

const createGenre=asyncHandler(async (req, res) => {
    
    const {id,name}=req.body
    const newgenre=new genre({
        genre_id:id,
        genre_name:name,
        storiesIds:[],
    })
        const genreSaved=await newgenre.save()
        res.status(201).json({message:"genre saved successfully!",genre:genreSaved});

   
});

const updateGenre=asyncHandler(async (req,res)=>{

    const id=req.params.id;
    if(!id){
         const err = new Error( "enter a valid id ");
        err.status = 400;
        throw err;
    }
    if(!req.body){
        const err = new Error( "enter a valid input ");
        err.status = 400;
        throw err;
    }
       
    else{
        const {newGenre}=req.body;
       
          const genreUpdated=await genre.findOneAndUpdate(
             { genre_id: id },
             {  genre_name:newGenre},
              {new:true});
          return res.status(200).json({message:"updated successfully:",user:genreUpdated});

    }
})
const getStoriesByIdGenre=asyncHandler(async (req, res) => {
    const genreId = parseInt(req.params.id); 
    if (!id) {
    const err = new Error("id is required");
    err.status = 400;
    throw err; // ← envoie l’erreur au middleware handleError
  }
     const genreFound=await genre.findOne({genre_id:id})
     if(!genreFound)
       {const err = new Error("genre not found");
        err.status = 404;
        throw err;
    } 
        const stories = await story.find({ story_id: { $in: genreFound.storiesIds } });
        return res.status(200).json({
            message:"Genre trouvé",
            stories:stories});
    
});
const countStoriesByGenre=asyncHandler(async(req,res)=>{
      const genreId = parseInt(req.params.id); 
    if (!genreId) {
    const err = new Error("id is required");
    err.status = 400;
    throw err; // ← envoie l’erreur au middleware handleError
  }
     const genreFound=await genre.findOne({genre_id:genreId})
     if(!genreFound)
        {const err = new Error("genre not found");
        err.status = 404;
        throw err;
       } 
    //  if(genreFound.storiesIds.length== 0)
    //     {deleted=await deleteGenre(id)
    //     return res.status(200).json({
    //         message:"genre deleted successfully",
    //         });}
     return res.status(200).json({
            lengthgenres:genreFound.storiesIds.length,
            });
        

})
const deleteGenreAndTheirStories=asyncHandler(async(req,res)=>{
      const id = parseInt(req.params.id); 
    if (!id) {
    const err = new Error("id is required");
    err.status = 400;
    throw err; // ← envoie l’erreur au middleware handleError
  }
     const genreFound=await genre.findOne({genre_id:id})
      genredeleted=await genre.findOneAndDelete({genre_id:id})
     if(genreFound.storiesIds.length !== 0)
       {const stories = await story.findOneAndDelete({ story_id: { $in: genreFound.storiesIds } });}

    return res.status(200).json({
            message:"genre deleted successfully with his stories",
            });
})

const addStoryTogenre=asyncHandler(async (req,res)=>{

    const id=req.params.id;
    if(!id){
         const err = new Error( "enter a valid id ");
        err.status = 400;
        throw err;
    }
    if(!req.body){
        const err = new Error( "enter a valid input ");
        err.status = 400;
        throw err;
    }
       
    else{
        const {storyID}=req.body;
        const genreUpdated=await user.findByIdAndUpdate(
                     { genre_id:id},
                     {
                      $push: { storiesIds: parseInt(storyID) }
                     },
                     {new:true});
          return res.status(200).json({message:"updated successfully:",user:genreUpdated});

    }
})


 module.exports={
    getAllGenres,
    createGenre,
    updateGenre,
    getStoriesByIdGenre,
    countStoriesByGenre,
    deleteGenreAndTheirStories
    
 }

