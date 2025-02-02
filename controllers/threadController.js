const { readThreads } = require('../threadDataHandler');
const threadServices = require('../services/threadServices');

exports.getThreads = (req, res) => {
    const threads = readThreads();
    res.json(threads);
}

exports.deleteThread = async (req, res) => {
    try {
        const threadId = req.params.threadId;
        threadServices.deleteThread(threadId);
        res.json({ message: `Thread ${threadId} deleted successfully ` });
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ error: 'Failed to delete thread' });
    }
}

exports.updateThreadTitle = (req, res) => {
    try {
        const { thread_id, title } = req.body;
        threadServices.updateThreadTitle({ thread_id, title });
        const updatedThread = threadServices.getThread(thread_id);
        res.json({ message: 'Thread title updated successfully', thread: updatedThread });
    } catch (error) {
        console.error('Error updating thread title:', error);
        res.status(500).json({ error: 'Failed to update thread title' });
    }
}


