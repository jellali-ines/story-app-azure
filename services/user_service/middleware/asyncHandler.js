// middleware/asyncHandler.js

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

// Ce middleware permet d’éviter de faire des try/catch dans tous les controllers 
// Usage dans un controller :

// const asyncHandler = require("../middleware/asyncHandler");

// exports.getKids = asyncHandler(async (req, res) => {
//    const user = await User.findById(req.params.userId);
//    res.json(user.kids);
// });