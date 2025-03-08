// const { readThreads } = require('../tools/threadDataHandler');
const threadService = require('../services/threadService');

exports.createNewThread = async (req, res) => {
    try {
        const { threadFirstMessage } = req.body;
        const newThread = await threadService.createNewThread(threadFirstMessage);
        res.json(newThread);
    }
    catch (error) {
        console.log('Error creating new thread : ', error)
        res.status(500).json({ error: 'Failed to create new thread' });
    }

}

exports.getThreads = async (req, res) => {
    const threads =  await threadService.getThreadsFromMongo();
    // const threads =  await threadService.getThreads();
    res.json(threads);
}

exports.deleteThread = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        threadService.deleteThread(threadId);
        res.json({ message: `Thread ${threadId} deleted successfully ` });
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'Failed to delete thread' });
    }
}

exports.updateThreadTitle = (req, res) => {
    try {
        const { thread_id, title } = req.body;

        if (!thread_id || !title) {
            return res.status(400).json({ error: 'Thread ID and title are required' });
        }

        threadService.updateThreadTitle({ thread_id, title });
        res.json({ message: 'Thread title updated successfully' });
    } catch (error) {
        console.error('Error updating thread title:', error);
        res.status(500).json({ error: 'Failed to update thread title' });
    }
}


