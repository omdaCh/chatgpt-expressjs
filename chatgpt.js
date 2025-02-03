const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;

const openai = new OpenAI({ apiKey: apiKey });

async function sendMessage(message) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "developer", content: "You are a funny assistant." },
            {
                role: "user",
                content: message,
            },
        ],
        max_tokens: 5,
        stop: ",",
        n: 2,
        logprobs: true
    });
    return JSON.stringify(completion.choices)
}

async function runAssistant() {
    const assistant = await openai.beta.assistants.create({
        name: "imad assistant",
        instructions: "You are a personal math tutor. Write and run code to answer math questions.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4o-mini"
    });

    const thread = await openai.beta.threads.create();
    console.log("thread.id = " + thread.id)

    const message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: "I need to solve the equation `3x + 11 = 14`. Can you help me?"
        }
    );

    const run = openai.beta.threads.runs.stream(thread.id, {
        assistant_id: assistant.id
    })
        .on('textCreated', (text) => process.stdout.write('\nassistant > '))
        .on('textDelta', (textDelta, snapshot) => {
            text = textDelta.value;
            process.stdout.write(text)
        })
        .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
        .on('toolCallDelta', (toolCallDelta, snapshot) => {
            if (toolCallDelta.type === 'code_interpreter') {
                if (toolCallDelta.code_interpreter.input) {
                    process.stdout.write(toolCallDelta.code_interpreter.input);
                }
                if (toolCallDelta.code_interpreter.outputs) {
                    process.stdout.write("\noutput >\n");
                    toolCallDelta.code_interpreter.outputs.forEach(output => {
                        if (output.type === "logs") {
                            process.stdout.write(`\n${output.logs}\n`);
                        }
                    });
                }
            }
        });
}

module.exports = { sendMessage, runAssistant };
