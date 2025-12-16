const express = require('express');
const app=express()
const PORT=3000;
const asyncHandler=require("express-async-handler")
app.use(express.json());
const bcrypt = require("bcrypt");

const story=require("./../models/Story")
const minioClient = require("../config/minioClient");

const getAllStories =asyncHandler(async (req, res) => {
  
        // Récupérer page et limit depuis les query params, par défaut page=1, limit=10
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculer le nombre de documents à sauter
        const skip = (page - 1) * limit;

        // Récupérer les utilisateurs avec pagination
        const stories = await story.find().skip(skip).limit(limit);

        // Récupérer le nombre total d'utilisateurs pour info
        const totalStories = await story.countDocuments();

        if (stories.length === 0) {
        //    const err = new Error("Users not found");
        //     err.status = 404;
        //      throw err;
        console.log("aaaaaaaaaaaaaaaaaaaa");
        
    
        }

        return res.status(200).json({
            message: "List of stories",
            page: page,
            limit: limit,
            totalStories: totalStories,
            totalPages: Math.ceil(totalStories / limit),
            stories: stories
        });

   
})

const getStoryById=asyncHandler(async (req, res) => {
    const id=req.params.id
    if(!id){
        return res.status(400).json({message:"donner id "});
    }
     const storyFound=await story.findById(id)
     if(!userfound)
        {const err = new Error("story not found");
        err.status = 404;
        throw err;
    } 
    else{
        return res.status(200).json({
            message:"utilisateur trouvé",
            user:storyFound});
    }
})

const createStory = asyncHandler(async (req, res) => {

    const {
        id,
        title,
        text,
        tags,
        author,
        language,
        recommended_age,
        genreIds,
        reading_time
    } = req.body;

    if (!req.files || !req.files.wavFile) {
        return res.status(400).json({ message: "Audio wav obligatoire" });
    }

    // ----- FICHIERS -----
    const audioFile = req.files.wavFile[0];     // WAV
    const imageFile = req.files.image ? req.files.image[0] : null; // Image pour Mongo

    // ----------------------------------------------------
    // 1️⃣ UPLOAD DU FICHIER WAV DANS MINIO
    // ----------------------------------------------------
    const audioFileName = `${Date.now()}-${audioFile.originalname}`;

    await minioClient.putObject(
        "stories-wavs",                // bucket minio
        audioFileName,            // nom
        audioFile.buffer,         // contenu
        audioFile.size,           // taille
        { "Content-Type": audioFile.mimetype }
    );

    const audioUrl = `http://localhost:9000/stories-wavs/${audioFileName}`;

    // ----------------------------------------------------
    // 2️⃣ STOCKER L'IMAGE DANS MONGODB
    //    (sous forme de Buffer directement)
    // ----------------------------------------------------
    let imageData = null;
    if (imageFile) {
        imageData = {
            data: imageFile.buffer,
            mimetype: imageFile.mimetype,
            filename: imageFile.originalname
        };
    }

    // ----------------------------------------------------
    // 3️⃣ CRÉER LA STORY
    // ----------------------------------------------------
    const newStory = new story({
        story_id: id,
        title,
        tags,
        text,
        reading_time: parseInt(reading_time),
        author,
        language,
        recommended_age,
        genresIds: [parseInt(genreIds)],

        audio: {
            url: audioUrl,
            filename: audioFileName
        },

        image: imageData // image stockée dans MongoDB
    });

    const savedStory = await newStory.save();
    res.status(201).json({
        message: "Story created successfully!",
        story: savedStory
    });
});

const updateStory = async (req, res) => {
    try {
        const {
            id,
            title,
            text,
            tags,
            author,
            language,
            recommended_age,
            genreIds,
            reading_time
        } = req.body;

        // Vérification fichiers
        if (!req.files || !req.files.wavFile) {
            return res.status(400).json({ message: "Audio wav obligatoire" });
        }

        const audioFile = req.files.wavFile[0];     // WAV
        const imageFile = req.files.image ? req.files.image[0] : null; // Image MongoDB
        const audioFileName = `${Date.now()}-${audioFile.originalname}`;

        // ----------------------------
        // 1️⃣ Upload du WAV dans MinIO
        // ----------------------------
        await minioClient.putObject(
            "stories-wavs",
            audioFileName,
            audioFile.buffer,
            audioFile.size,
            { "Content-Type": audioFile.mimetype }
        );

        const audioUrl = `http://localhost:9000/stories-wavs/${audioFileName}`;

        // ----------------------------
        // 2️⃣ Image (optionnelle)
        // ----------------------------
        let imageData = undefined;
        if (imageFile) {
            imageData = {
                data: imageFile.buffer,
                mimetype: imageFile.mimetype,
                filename: imageFile.originalname
            };
        }

        // ----------------------------
        // 3️⃣ Conversion sécurisée genreIds
        // ----------------------------
        const genreIdInt = parseInt(genreIds);
        if (isNaN(genreIdInt)) {
            return res.status(400).json({ message: "genreIds doit être un nombre valide" });
        }

        // ----------------------------
        // 4️⃣ Mise à jour de la story
        // ----------------------------
        const updatedStory = await story.findByIdAndUpdate(
            id,
            {
                title,
                tags,
                text,
                reading_time: parseInt(reading_time),
                author,
                language,
                recommended_age,

                // ajoute uniquement si pas déjà présent
                $addToSet: { genresIds: genreIdInt },

                audio: {
                    url: audioUrl,
                    filename: audioFileName
                },

                ...(imageData && { image: imageData }) // image uniquement si fournie
            },
            { new: true }
        );

        res.status(200).json({
            message: "Story updated successfully!",
            story: updatedStory
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
const deleteStory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Vérifier si la story existe
        const existingStory = await story.findById(id);
        if (!existingStory) {
            return res.status(404).json({ message: "Story introuvable" });
        }

        // 2️⃣ Récupérer le fichier audio stocké sur Minio
        const audioFileName = existingStory.audio?.filename;

        // 3️⃣ Supprimer l'audio de Minio si présent
        if (audioFileName) {
            await minioClient.removeObject("stories-wavs", audioFileName);
            console.log("🎧 Audio supprimé de Minio :", audioFileName);
        }

        // 4️⃣ Supprimer la story de MongoDB
        await story.findByIdAndDelete(id);

        res.json({
            message: "Story supprimée avec succès, audio supprimé aussi."
        });
    } catch (error) {
        console.error("Erreur dans deleteStory :", error);
        res.status(500).json({
            message: "Erreur serveur",
            error: error.message
        });
    }
};

 module.exports={
    getAllStories,
    createStory,
    updateStory,
    getStoryById,
    deleteStory
 }

