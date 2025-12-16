const express = require('express');
const router = express.Router();
const {
  getAllFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder
} = require('../controllers/folderController');

// Base route: /api/folders
router.route('/')
  .get(getAllFolders)     // GET /api/folders
  .post(createFolder);    // POST /api/folders

// Route with ID: /api/folders/:id
router.route('/:id')
  .get(getFolder)         // GET /api/folders/:id
  .put(updateFolder)      // PUT /api/folders/:id
  .delete(deleteFolder);  // DELETE /api/folders/:id

module.exports = router;