const { readThreads, deleteThread, saveThreads, saveThread } = require('../threadDataHandler')

const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;

const openai = new OpenAI({ apiKey: apiKey });

exports.createNewThread = async (threadFirst_message) => {
    const newThread = await openai.beta.threads.create();
    const threadTitle = threadFirst_message;
    if (countWords(threadFirst_message) > 10) {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Generate a short and concise title (maximum 5 words) for a chat thread based on the following message:",
                },
                {
                    role: "user",
                    content: threadFirst_message,
                },
            ],
            max_tokens: 15,
            temperature: 0.7,
        });
        threadTitle = completion.choices[0].message.content.trim();
    }


    saveThread(newThread.id, newThread.created_at, threadTitle);
    return { "thread_id": newThread.id, "created_at": newThread.created_at, "title": threadTitle };
}

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

function countWords(str) {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

