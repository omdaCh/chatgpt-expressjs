const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/:threadId', messageController.getThreadMessages);

router.post('/send-message', messageController.sendMessage);

router.post('/send-message-on-stream', messageController.sendMessageOnStream);

router.post('/create-user-message', messageController.createUserMessage);

module.exports = router;