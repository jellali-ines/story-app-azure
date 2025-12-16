// const mongoose =require ('mongoose');
// const ConnectDB=async()=>{
//     try{
//         await mongoose.connect(process.env.MONGODB_URI);
//         console.log("connection reussi");
//     }catch(err){
       

//         console.log("erreur",err.message);
//         process.exit(1);
        
//     }
// };

// module.exports=ConnectDB;

// db.js

const mongoose = require('mongoose');

// Déclaration de la variable de connexion
let gfsConnection = null; 

const ConnectDB = async () => {
    try {
        // Utiliser createConnection au lieu de connect pour mieux gérer les connexions multiples/GridFS
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        gfsConnection = conn; // Stocke l'objet de connexion pour GridFS

        console.log("Connection reussie à MongoDB.");
        return conn; // Retourne la connexion si nécessaire
    } catch (err) {
        console.log("Erreur de connexion à MongoDB:", err.message);
        process.exit(1);
    }
};


// Exporter la fonction de connexion et l'objet de connexion après l'exécution
module.exports = {
    ConnectDB,
    //getGfsConnection: () => gfsConnection // Fonction pour récupérer l'objet de connexion
};