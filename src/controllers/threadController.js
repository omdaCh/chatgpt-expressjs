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
    const threads = await threadService.getThreads();
    res.json(threads);
}

exports.deleteThread = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        await threadService.deleteThread(threadId);
        res.json({ message: `Thread ${threadId} deleted successfully ` });
    } catch (error) {
        if (error.message.includes("404 No thread found with id")) {
            res.status(404).json({ error: 'No thread found with id' });
        }else{
            console.error('Error deleting thread:', error);
            res.status(500).json({ error: 'Failed to delete thread' });
        }
 
    }
}

exports.updateThreadTitle = async (req, res) => {
    try {
        const { thread_id, title } = req.body;
        if (!thread_id || !title) {
            res.status(400).json({ error: 'Thread ID and title are required' });
            return;
        }
        await threadService.updateThreadTitle(thread_id, title);
        res.json({ message: 'Thread title updated successfully' });
    } catch (error) {
        console.error('Error updating thread title:', error);
        if (error.message === 'Thread not found') {
            res.status(404).json({ error: 'Thread not found' });
            return;
        }

        res.status(500).json({ error: `Failed to update thread title : ${error}` });
    }
}


