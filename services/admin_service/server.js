const express=require('express')
const cookieParser = require('cookie-parser');
const app= express();
const PORT=3000;
require('dotenv').config();
const {ConnectDB}=require("./config/db");
ConnectDB().then(() => {
const Routes=require('./routes');
const {urlNotFound,errorHandler}=require("./middelwares/errorMiddewares")
app.use('/api/admin',Routes)
app.use(urlNotFound)
app.use(errorHandler)
app.use('/public', express.static('public'));
})

app.use(express.json());
app.use(cookieParser());



app.listen(PORT,()=>{
    console.log(`serveur demarré sur http://localhost: ${PORT}`);  
})
