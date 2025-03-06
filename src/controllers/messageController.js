const messageService = require('../services/messageService');
require('dotenv').config();


exports.getThreadMessages = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        const threadMessages = await messageService.getThreadMessages(threadId);
        res.json(threadMessages);
    } catch (error) {
        console.error('Error getting thread\'s messages thread:', error);
        res.status(500).json({ error: 'Failed getting thread\'s messages' });
    }
}

exports.sendMessage = async (req, res) => {
    try {
        const threadId = req.body.threadId;
        const assistantId = req.body.assistantId;
        const userMessage = req.body.userMessage;

        const gptRespence = await messageService.sendMessage(threadId, assistantId, userMessage);
        res.json(gptRespence);

    } catch (error) {
        console.error('Error treating the message:', error);
        res.status(500).json({ error: 'Failed to treat the message' });
    }
}

exports.sendMessageOnStream = async (req, res) => {
    let threadId = null
    try {

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        threadId = req.body.threadId;
        const assistantId = req.body.assistantId;

        const streamEmitter = await messageService.sendStreamMessage(threadId, assistantId);

        streamEmitter.on(`response-object-${threadId}`, (finalResponse) => {
            res.write(`responseObject: ${JSON.stringify(finalResponse)}`);
        });

        streamEmitter.on(`stream-${threadId}`, (token) => {
            res.write(`streamChunk: ${JSON.stringify({ token })}\n\n`);
        });

        streamEmitter.on(`end-${threadId}`, () => {
            res.end();
        });

    } catch (error) {
        console.error('Error treating  the message:', error);
        res.status(500).json({ error: 'Failed to treat the message' });
    }
    finally {
        // messageService.removeStream(threadId);
    }
}

exports.stopMessageStream = async (req, res) => {
    try {
        const threadId = req.body.threadId;

        // Call the service method to stop the stream
        const result = await messageService.stopMessageStream(threadId);

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error stopping the stream:', error);
        res.status(500).json({ error: 'Failed to stop the stream' });
    }
}

exports.createUserMessage = async (req, res) => {
    try {
        const threadId = req.body.threadId;
        const userMessage = req.body.userMessage;
        const files = req.body.files;

        const createdUserMessage = await messageService.createUserMessage(threadId, userMessage, files);
        res.json(createdUserMessage);

    } catch (error) {
        console.error('Error creating the message:', error);
        res.status(500).json({ error: 'Failed to create the message' });
    }

}