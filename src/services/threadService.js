const  MngThread  = require('../models/threadSchema');
const { readThreads, deleteThread, saveThreads, saveThread } = require('../tools/threadDataHandler')
const threadDataHandler = require('../tools/threadDataHandler');

const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;

const openai = new OpenAI({ apiKey: apiKey });

exports.getThreadsFromMongo = async () => {
    try {
        const threads = await MngThread.find();
        return threads;
    } catch (error) {
        console.log('error finding threads = ' , error);
        throw new Error('Error getting threads from mongodb')
    }
}

exports.getThreads = async () => {
    try {
        const threads = threadDataHandler.readThreads();
        return threads;
    } catch (error) {
        console.log('error finding threads = ' , error);
        throw new Error('Error getting threads from mongodb')
    }
}

exports.createNewThread = async (threadFirst_message) => {
    const newThread = await openai.beta.threads.create();
    let threadTitle = threadFirst_message;
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

    try {
        await openai.beta.threads.del(threadId);
        deleteThread(threadId);
    } catch (error) {
        if (error.message.includes("404 No thread found with id")) {
            deleteThread(threadId);
        } else {
            console.error('Error deleting thread from openai:', error);
        }

    }

};

exports.updateThreadTitle = ({ thread_id, title }) => {

    const threads = readThreads();

    const threadIndex = threads.findIndex((thread) => thread.thread_id === thread_id);

    if (threadIndex === -1) {
        throw new Error(`Thread not found : ${thread_id}`)
    }

    threads[threadIndex].title = title;

    saveThreads(threads);
};

function countWords(str) {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

