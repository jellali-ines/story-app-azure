const  multer =require("multer");
const storage = multer.memoryStorage(); // stocker en RAM avant d’enregistrer
const upload = multer({ storage });

module.exports= upload;
