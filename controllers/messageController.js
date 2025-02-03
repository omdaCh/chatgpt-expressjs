const messageService = require('../services/messageService');

exports.getThreadMessages = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        const threadMessages = await messageService.getThreadMessages(threadId);
        res.json(threadMessages);
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'Failed to delete thread' });
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
    try {

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const threadId = req.body.threadId;
        const assistantId = req.body.assistantId;


        const runStream = await messageService.sendStreamMessage(threadId, assistantId);

        for await (const chunk of runStream) {
            if (chunk.event === 'thread.message.delta') {
                const token = chunk.data?.delta?.content[0]?.text?.value;
                if (token && token.length !== 0) {
                    res.write(`data: ${JSON.stringify({ token })}\n\n`);
                } else {
                    console.log('Token is undefined or empty');
                }
            } else if (chunk.event === 'thread.run.created') {
                console.log('Thread run created:', chunk.data);
            } else {
                console.log('Unexpected event:', chunk.event);
            }

        }

        res.end();


    } catch (error) {
        console.error('Error treating the message:', error);
        res.status(500).json({ error: 'Failed to treat the message' });
    }
}

exports.createUserMessage = async (req, res) => {
    try {
        const threadId = req.body.threadId;
        const userMessage = req.body.userMessage;

        const createdUserMessage = await messageService.createUserMessage(threadId, userMessage);
        res.json(createdUserMessage);

    } catch (error) {
        console.error('Error creating the message:', error);
        res.status(500).json({ error: 'Failed to create the message' });
    }

}