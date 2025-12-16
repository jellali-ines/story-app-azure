const mongoose = require("mongoose");
const validator = require("validator");
/*============================
KID SUB-SCHEMA (Embedded)
=============================== */
const KidSchema = new mongoose.Schema({
name:String,
age: Number,
avatar: String, // URL ou chemin de l'avatar

preferred_genres: [String],
preferred_characters: [String],
preferred_emotions: [String],
preferred_reading_time: [String],
total_likes: { type: Number, default: 0 },
total_completed: { type: Number, default: 0 },
total_stories_read: { type: Number, default: 0 },
total_reading_time_minutes: { type: Number, default: 0 }

});



/* ============================
USER SCHEMA (Parent)
=============================== */
const UserSchema = new mongoose.Schema({
user_name: { type: String, required: true },
phone: {
    type: Number,
    required:[true,"phone number is required"],
    length:[8,"phone number must have 8 digits"]
},
region : String,
email: { type: String,
required: true,
unique: true,
index: true,
validate: {
validator: (value) => validator.isEmail(value),
message: "Email invalide"
} },
password_hash: {
type: String,
required: true,
minlength:[8,"password must have 8 letters minimum"] },
role: {
    type: String,
    enum: ["parent", "admin"],
    default: "parent"
},

payment_expires_date:{type:Date},
active: { type: Boolean, default: true },
// Liste des enfants EMBEDDED
kids: [KidSchema],
payment_history:[
{
payment_type: {
default:"Monthly",
type: String,
required:true,
},
image: {
data: Buffer, // image binaire
contentType: String
},
datePayment:{
type:Date,
},
amount:{
type:Number
},
}
]
}, {
timestamps: true,
collection: "User"
});


module.exports = mongoose.model("User", UserSchema);