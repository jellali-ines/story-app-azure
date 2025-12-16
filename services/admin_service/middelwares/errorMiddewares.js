
const validator = require("validator");
const urlNotFound=(req,res,next)=>{
    const error=new Error(`Url demandé introuvable ${req.originalUrl}`);
    res.status(404);
    next(error);
}
const errorHandler=(err,req,res,next)=>{
    if (err.code === 11000) {
        return res.status(409).json({
            message: "erreur duplication de champs",
            description: "document exist"
        });
    }
    const statusCode = err.status || 500;
    res.status(statusCode);
    res.json({message:"error",erreur:err.message,stack:process.env.NODE_ENV==='production'?
        null:err.stack});    
    // const statusCode=res.statusCode===200?500:req.statusCode
    // res.status(statusCode);
    // res.json({message:"erreur détecté",erreur:err.message,stack:process.env.NODE_ENV==='production'?
    //     null:err.stack});
    };
function validateUser(req, res, next) {
  const {username,email,password,role,phone,payment_type,region} = req.body;
  console.log(req.body);
  
  if ( !username || !email || !password  || !phone || !payment_type || !region)
        return res.status(400).json({ error: "inputs are required" });
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ error: "Enter valid email" });
  }
  if(!phone || phone.toString().length!=8){
        return res.status(400).json({ error: "enter valid phone number" });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "length of Password must be >=8" });
  }

  next();
}

function validateCredientials(req, res, next) {
  const {login,pwd} = req.body;
  console.log(req.body);
  
  if (  !login || !pwd )
        return res.status(400).json({ error: "inputs are required" });
  if (!login || !validator.isEmail(login)) {
    return res.status(400).json({ error: "Enter valid login" });
  }
  if (!pwd || pwd.length < 8) {
    return res.status(400).json({ error: "length of Password must be >=8" });
  }

  next();
}

function validateGenre(req, res, next) {
  const {id,name} = req.body;
  console.log(req.body);
  
  if (  !id || !name )
        return res.status(400).json({ error: "inputs are required" });

  next();
}


module.exports={
    urlNotFound,
    errorHandler,
    validateUser,
    validateCredientials,
    validateGenre
}