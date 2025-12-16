// const multer = require('multer');
// const { GridFsStorage } = require('multer-gridfs-storage');
// const { getGfsConnection } = require('./db');

// let uploadGridFS;

// const configureGridFs = () => {
//   const conn = getGfsConnection();
//   if (!conn) {
//     console.error("Erreur: Connexion DB non prête.");
//     return;
//   }

//   const storage = new GridFsStorage({
//     db: conn,
//     file: (req, file) => ({
//       filename: `wav-${Date.now()}-${file.originalname}`,
//       bucketName: 'audio_uploads'
//     })
//   });

//  uploadGridFS = multer({ storage });
//   return uploadGridFS;

// };

// // // Exporter une fonction pour s'assurer que Multer est configuré
// const getUploadMiddlewareGridFS = () => {
//   if (!uploadGridFS) {
//     configureGridFs();
//   }
//   return uploadGridFS;
// };

//  module.exports = { getUploadMiddlewareGridFS };
