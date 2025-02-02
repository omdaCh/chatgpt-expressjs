const { readThreads, deleteThread, saveThreads } = require('../threadDataHandler')

const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;

const openai = new OpenAI({ apiKey: apiKey })

exports.deleteThread = async (threadId) => {
    await openai.beta.threads.del(threadId);
    deleteThread(threadId);
};

exports.updateThreadTitle = ({ thread_id, title }) => {

    if (!thread_id || !title) {
        return res.status(400).json({ error: 'Thread ID and title are required' });
    }

    const threads = readThreads();

    const threadIndex = threads.findIndex((thread) => thread.thread_id === thread_id);

    if (threadIndex === -1) {
        return res.status(404).json({ error: 'Thread not found' });
    }

    threads[threadIndex].title = title;

    saveThreads(threads);
};