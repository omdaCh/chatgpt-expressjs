const express = require('express');

const threadController = require('../controllers/threadController')

const router = express.Router();


router.get('/', threadController.getThreads);

router.delete('/:threadId', threadController.deleteThread);

router.put('/:update-title', threadController.updateThreadTitle);

// app.get('/threads/new-thread', async (req, res) => {
//     try {
//         const thread = await openai.beta.threads.create();
//         console.log("thread.id = " + thread.id)
//         saveThread(thread.id, thread.created_at);
//         res.json({ thread_id: thread.id, created_at: thread.created_at });
//     } catch (error) {
//         console.error('Error creating thread:', error);
//         res.status(500).json({ error: 'Failed to create thread' });
//     }
// });

// app.delete('/threads/:threadId', async (req, res) => {
//     const threadId = req.params.threadId; // Get the thread ID from the URL
//     console.log('delete method have been called')
//     try {
//         // Step 1: Remove the thread from the JSON file
//         const threads = readThreads();
//         const updatedThreads = threads.filter(thread => thread.thread_id !== threadId);

//         // Save the updated list of threads
//         fs.writeFileSync(threadsFilePath, JSON.stringify(updatedThreads, null, 2));

//         // Step 2: (Optional) Delete the thread from OpenAI
//         await openai.beta.threads.del(threadId);

//         // Send a success response
//         res.json({ message: `Thread ${threadId} deleted successfully` });
//     } catch (error) {
//         console.error('Error deleting thread:', error);
//         res.status(500).json({ error: 'Failed to delete thread' });
//     }
// });

// app.post('/threads/new-conversation', async (req, res) => {
//     const { message: first_message } = req.body; // Get the first message from the request body

//     try {
//         // Step 1: Create a new thread
//         const thread = await openai.beta.threads.create();
//         console.log('New thread created:', thread.id);

//         // Step 2: Add the first message to the thread
//         const messageResponse = await openai.beta.threads.messages.create(thread.id, {
//             role: 'user',
//             content: first_message,
//         });
//         console.log('First message added:', messageResponse.id);

//         // Step 3: Save the thread ID and creation time
//         saveThread(thread.id, thread.created_at, first_message);

//         // Step 4: Send the thread ID and first message response to the frontend
//         res.json({
//             thread_id: thread.id,
//             created_at: thread.created_at,
//             title: first_message,
//             response: messageResponse,
//         });
//     } catch (error) {
//         console.error('Error starting new conversation:', error);
//         res.status(500).json({ error: 'Failed to start new conversation' });
//     }
// });

module.exports = router;