const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

// router.get('/:fileId', fileController.getFile);

router.post('/upload-and-create-file', fileController.createFile);
router.get('/:fileId', fileController.getFile);


module.exports = router;