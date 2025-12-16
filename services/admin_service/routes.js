const express=require('express')
const router=express.Router();

//importer les fonctions du controlleurs
const upload =require("./middelwares/upload"); // ← utiliser import
// const {getUploadMiddlewareGridFS}=require("./config/gridfs")
const {   
    getAllUsers,
    createUser,
    updateUser,
    getUserById,
    getKidsByUser,
    updatePayment
    //getUserByRole
}=require("./controllers/UserController");
const {
    getAllGenres,
    createGenre,
    updateGenre,
    getStoriesByIdGenre,
    countStoriesByGenre,
    deleteGenreAndTheirStories
    
 }=require("./controllers/GenreController")
 const {
    createStory,
    getAllStories,
    deleteStory,
    updateStory,
    getStoryById,
    
 }=require("./controllers/StoryController")
const {authenticateToken,adminOnly}=require("./middelwares/jwtMidelware")
const {login,refreshTokenHandler}=require("./controllers/authController")
const {validateUser,
    validateCredientials,
    validateGenre}=require("./middelwares/errorMiddewares");
//definition des routes
//router.get("/getUserByRole",getUserByRole);
router.post('/login',validateCredientials,login);
router.post('/refreshToken',refreshTokenHandler);
router.get("/user/:id",authenticateToken,adminOnly,getUserById);
router.get("/user/:id/kids",authenticateToken,adminOnly,getKidsByUser);
router.get("/users",authenticateToken,adminOnly,getAllUsers);
router.post('/user/add' ,upload.single('image'),authenticateToken,adminOnly,validateUser,createUser);
router.put("/:id/updateUser",authenticateToken,adminOnly,updateUser);
router.put("/:id/updatePayment",upload.single('image'),authenticateToken,adminOnly,updatePayment);

router.post('/genre/add',authenticateToken,adminOnly,validateGenre,createGenre);
router.get("/genre/:id/stories",authenticateToken,adminOnly,getStoriesByIdGenre);
router.get("/genres",authenticateToken,adminOnly,getAllGenres);
router.put("/genre/:id/update",authenticateToken,adminOnly,updateGenre);
router.get("/genre/:id/count",authenticateToken,adminOnly,countStoriesByGenre);
router.delete("/genre/:id/delete",adminOnly,deleteGenreAndTheirStories);
router.post('/story/add' , 
upload.fields([
    { name: "image", maxCount: 1 },
    { name: "wavFile", maxCount: 1 }
  ]),authenticateToken,adminOnly,createStory);
router.get("/stories",authenticateToken,adminOnly,getAllStories);
router.delete("/story/:id/delete",authenticateToken,adminOnly, deleteStory);
router.put("/story/:id/update",authenticateToken,adminOnly,updateStory);
router.get("/story/:id",authenticateToken,adminOnly,getStoryById);





// gridfs=getUploadMiddlewareGridFS()
// router.post('/story/add' ,gridfs.single('wavFile'),authenticateToken,adminOnly,createStory);




module.exports=router;
