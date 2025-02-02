const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

exports.getThreadMessages = async (threadId) => {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
}

exports.sendMessage = async (threadId, assistantId, userMessage) => {
    const thread = await openai.beta.threads.retrieve(threadId);

    await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId,
        // max_completion_tokens: 200,
        // max_prompt_tokens: 256
    });

    // const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        console.log('Run status:', runStatus.status);

        if (runStatus.status === 'failed' || runStatus.status === 'expired') {
            return res.status(500).json({ error: 'Run failed or expired', details: runStatus });
        }
    }

    const messages = await openai.beta.threads.messages.list(thread.id);

    const gptResponse = messages.data;

    return gptResponse;
}

exports.sendStreamMessage = async (threadId, assistantId) => {

    const runStream = await openai.beta.threads.runs.create(
        threadId, {
        assistant_id: assistantId,
        stream: true
        // max_completion_tokens: 200,
        // max_prompt_tokens: 256
    });

    return runStream;

}

exports.createUserMessage = async (threadId, userMessage) => {
    const createdUserMessage = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage,
    });

    return createdUserMessage;
}
