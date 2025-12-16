const  mongoose=require("mongoose")
const connectDB =async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connexion MongoDB OK .....");
    } catch (error) {
        console.log("connexion MongoDB échouée .....");
        process.exit(1)  ;             
    }
}
module.exports= connectDB