const MngThread = require('../models/threadSchema');

const { OpenAI } = require("openai");


require('dotenv').config();
const apiKey = process.env.API_KEY;

const openai = new OpenAI({ apiKey: apiKey });

exports.getThreads = async () => {
    try {
        const threads = await MngThread.find();
        return threads;
    } catch (error) {
        console.log('error finding threads = ', error);
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

    let mngThread = new MngThread({ "thread_id": newThread.id, "created_at": newThread.created_at, "title": threadTitle })
    await mngThread.save();

    return { "thread_id": newThread.id, "created_at": newThread.created_at, "title": threadTitle };
}

exports.deleteThread = async (threadId) => {
    await openai.beta.threads.del(threadId);
    await MngThread.deleteOne({ thread_id: threadId });
};

exports.updateThreadTitle = async (threadId, newTitle) => {
    const result = await MngThread.updateOne(
        { thread_id: threadId },
        { $set: { title: newTitle } });
    if (result.matchedCount === 0) {
        console.log('Thread not found');
        throw new Error('Thread not found');
    }

    console.log('update successful:', result);
    return result;
};

function countWords(str) {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

