const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

const activeStreams = new Map();


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

    activeStreams.set(threadId, runStream);

    handleRunStream(runStream, threadId);

    return eventEmitter;
}

async function handleRunStream(stream, threadId) {
    let switchingToToolOutputStream = false;
    for await (const chunk of stream) {
        // console.log('chunk = ' + JSON.stringify(chunk));
        if (chunk.event === 'thread.message.delta') {
            const token = chunk.data?.delta?.content[0]?.text?.value;
            if (token && token.length !== 0) {
                eventEmitter.emit(`stream-${threadId}`, token);
            } else {
                console.log('Token is undefined or empty');
            }
        } else if (chunk.event === 'thread.run.created') {
            runId = chunk.data.id
            // console.log('Thread run created:', chunk.data);
        } else if (chunk.event === 'thread.run.requires_action') {

            // Extract the function call details
            const requiredActions = chunk.data.required_action;
            if (requiredActions.type === "submit_tool_outputs") {
                switchingToToolOutputStream = true;
                const functionCalls = requiredActions.submit_tool_outputs.tool_calls;

                const toolOutputs = await Promise.all(functionCalls.map(async (toolCall) => {
                    const functionName = toolCall.function.name;
                    const functionArguments = JSON.parse(toolCall.function.arguments);

                    let functionResult;
                    if (functionName === "analyze_image") {
                        const { file_id, question } = functionArguments;
                        // functionResult = 'the image is a cat';
                        functionResult = await analyzeImage(file_id, question);
                    } else {
                        functionResult = { error: "Unknown function" };
                    }

                    return {
                        tool_call_id: toolCall.id,
                        output: JSON.stringify(functionResult)
                    };
                }));

                const assistantStream = openai.beta.threads.runs.submitToolOutputsStream(
                    chunk.data.thread_id,
                    chunk.data.id,
                    {
                        tool_outputs: toolOutputs
                    });

                handleRunStream(assistantStream, threadId);
            }
        }
        else if (chunk.event === 'thread.message.completed') {
            eventEmitter.emit(`response-object-${threadId}`, chunk.data);
        }
    }

    //in this case the SubmitToolOutputs stream will be the response stream 
    if (!switchingToToolOutputStream) {
        eventEmitter.emit(`end-${threadId}`);
        strmResponseMessageId = null;
    }

}

async function analyzeImage(file_id, question) {

    //get the file content
    const fileContent = await openai.files.content(file_id);

    // Convert the response buffer to Base64
    const fileBuffer = await fileContent.arrayBuffer();
    const base64Image = Buffer.from(fileBuffer).toString("base64");
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: question },
                    {
                        type: "image_url",
                        image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                    },
                ],
                max_tokens: 10,
            },
        ],
        store: true,
    });
    return response.choices[0];
}

exports.stopMessageStream = async (threadId) => {

    const runStream = activeStreams.get(threadId);

    if (runStream) {
        runStream.destroy(); // Stop the stream
        activeStreams.delete(threadId); // Remove the stream reference
        return { success: true, message: 'Stream stopped successfully' };
    } else {
        return { success: false, message: 'No active stream found for the given threadId' };
    }
}

exports.createUserMessage = async (threadId, userMessage, files) => {
    let createdUserMessage = null;
    if (files.length > 0) {
        let attachments = createAttachementFromFile(files);
        createdUserMessage = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: userMessage,
            attachments: attachments
        });
    } else {
        createdUserMessage = await openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: userMessage
        });
    }

    return createdUserMessage;
}

function createAttachementFromFile(files) {
    let attachments = [];
    files.forEach(fileId => {
        attachments.push({
            file_id: fileId,
            tools: [{ type: "code_interpreter" }]
        })
    });
    return attachments;
}

exports.removeStream = (threadId) => {
    activeStreams.delete(threadId);
}



