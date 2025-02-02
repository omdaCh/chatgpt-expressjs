
const cors = require('cors');
const express = require('express')

const { saveThread } = require('./threadDataHandler');

const threadRoutes = require('./routes/threadRoutes');

const messageRoutes = require('./routes/messageRoutes');


const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));



app.use(cors({
  origin: 'http://localhost:4200', // Allow requests from this origin
  methods: ['GET', 'PUT', 'POST', 'DELETE'], // Allow only specified HTTP methods
  credentials: true, // Allow cookies and credentials (if needed)
}));


app.use('/threads', threadRoutes);

app.use('/messages', messageRoutes);


const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;

const openai = new OpenAI({ apiKey: apiKey });

// Endpoint to handle streaming
app.post('/stream-chat', async (req, res) => {
  const { message } = req.body;

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Call OpenAI API with streaming enabled
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }],
    stream: true, // Enable streaming
    max_tokens: 200,
  });

  // Stream the response to the client
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token && token.length !== 0) {
      res.write(`${JSON.stringify({ token })}\n\n`); // Send each token as a JSON object
    }

  }

  res.end(); // End the stream
});

app.post('/ai_assistant', async (req, res) => {
  const assistant = await openai.beta.assistants.create({
    name: "imad assistant",
    instructions: "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4o-mini"
  });

  const thread = await openai.beta.threads.create();

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
      process.stdout.write(text);
      res.write(`${JSON.stringify({ text })}\n\n`);
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
})

// Endpoint to stream assistant responses
app.get('/assistant', async (req, res) => {
  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers to the client

  // Create an assistant
  const assistant = await openai.beta.assistants.create({
    name: "imad assistant",
    instructions: "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4"
  });



  // Add a user message to the thread
  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "I need to solve the equation `3x + 11 = 14`. Can you help me?"
  });

  // Stream the assistant's response
  const run = openai.beta.threads.runs.stream(thread.id, {
    assistant_id: assistant.id
  })
    .on('textCreated', (text) => {
      // Send a chunk to the client
      res.write(`${JSON.stringify({ type: 'textCreated', data: '\nassistant > ' })}\n\n`);
    })
    .on('textDelta', (textDelta, snapshot) => {
      // Send a chunk to the client
      res.write(`${JSON.stringify({ type: 'textDelta', data: textDelta.value })}\n\n`);
    })
    .on('toolCallCreated', (toolCall) => {
      // Send a chunk to the client
      res.write(`${JSON.stringify({ type: 'toolCallCreated', data: `\nassistant > ${toolCall.type}\n\n` })}\n\n`);
    })
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
      if (toolCallDelta.type === 'code_interpreter') {
        if (toolCallDelta.code_interpreter.input) {
          // Send a chunk to the client
          res.write(`${JSON.stringify({ type: 'codeInput', data: toolCallDelta.code_interpreter.input })}\n\n`);
        }
        if (toolCallDelta.code_interpreter.outputs) {
          // Send a chunk to the client
          res.write(`${JSON.stringify({ type: 'codeOutput', data: "\noutput >\n" })}\n\n`);
          toolCallDelta.code_interpreter.outputs.forEach(output => {
            if (output.type === "logs") {
              res.write(`${JSON.stringify({ type: 'codeOutput', data: `\n${output.logs}\n` })}\n\n`);
            }
          });
        }
      }
    })
    .on('end', () => {
      // Close the connection when the stream ends
      res.end();
    });

  // // Handle client disconnect
  // req.on('close', () => {
  //   console.log('Client disconnected');
  //   run.abort(); // Abort the stream if the client disconnects
  //   res.end();
  // });
});





app.post('/threads/new-conversation1', async (req, res) => {
  const { message: first_message } = req.body; // Get the first message from the request body

  try {
    // Step 1: Create a new thread
    const thread = await openai.beta.threads.create();
    console.log('New thread created:', thread.id);

    // Step 2: Add the first message to the thread
    const messageResponse = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: first_message,
    });

    run = openai.beta.threads.runs.create(
      thread.id, {
      assistant_id: 'asst_JLZHCjwrwtUal0nxHPdGpsYg', // Use the assistant ID created earlier
    }
    )
    messages = openai.beta.threads.messages.list(
      thread.id
    )
    console.log("messages ", messages);
    // console.log('First message added:', messageResponse.id);
    // console.log('response :', JSON.stringify(messageResponse.content));

    // Step 3: Save the thread ID and creation time
    saveThread(thread.id, thread.created_at, first_message);

    // Step 4: Send the thread ID and first message response to the frontend
    res.json({
      thread_id: thread.id,
      created_at: thread.created_at,
      title: first_message,
      response: messageResponse,
    });
  } catch (error) {
    console.error('Error starting new conversation:', error);
    res.status(500).json({ error: 'Failed to start new conversation' });
  }
});

app.post('/threads/new-conversation', async (req, res) => {
  const { message: first_message } = req.body;

  try {

    // Step 1: Create a new thread
    const thread = await openai.beta.threads.create();
    console.log('New thread created:', thread.id);

    // Step 1: Add the user's message to the thread
    const userMessage = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: first_message,
    });
    console.log('User message added:', userMessage.id);

    // Step 2: Create a run to trigger the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: 'asst_JLZHCjwrwtUal0nxHPdGpsYg', // Use the assistant ID created earlier
    });
    console.log('Run created:', run.id);

    // Step 3: Poll the run status until it's completed
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Run status:', runStatus.status);

      // Handle failed or expired runs
      if (runStatus.status === 'failed' || runStatus.status === 'expired') {
        return res.status(500).json({ error: 'Run failed or expired', details: runStatus });
      }
    }

    // Step 4: Retrieve the updated messages from the thread
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log('All messages:', messages.data);

    // Step 5: Extract the assistant's response
    const pureMessages = messages.data.map((msg) => {
      return msg.content
        .filter((item) => item.type === 'text') // Filter only text content
        .map((item) => item.text.value) // Extract the text value
        .join(' '); // Join multiple text items into a single string
    });


    saveThread(thread.id, thread.created_at, first_message);

    res.json({
      thread_id: thread.id,
      created_at: thread.created_at,
      title: first_message,
      response: messages,
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to send message or get response' });
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})