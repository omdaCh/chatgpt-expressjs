const express = require('express');

const threadController = require('../controllers/threadController')

const router = express.Router();

router.post('/create-new-thread', threadController.createNewThread);

router.get('/', threadController.getThreads);

router.delete('/:threadId', threadController.deleteThread);

router.put('/:update-title', threadController.updateThreadTitle);

module.exports = router;