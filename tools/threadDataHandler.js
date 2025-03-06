const path = require('path');
const fs = require('fs');
const threadsFilePath = path.join(__dirname, '../data/threads.json');

// Function to read thread IDs from the JSON file
function readThreads() {
    if (!fs.existsSync(threadsFilePath)) {
        return []; // Return an empty array if the file doesn't exist
    }
    const data = fs.readFileSync(threadsFilePath, 'utf-8');
    return JSON.parse(data);
}

// Function to save thread IDs to the JSON file
function saveThread(threadId, createdAt, title) {
    const threads = readThreads();
    threads.push({ "thread_id": threadId, "created_at": createdAt, "title": title }); // Add the new thread ID
    fs.writeFileSync(threadsFilePath, JSON.stringify(threads, null, 2)); // Save to file
}

function saveThreads(threads) {
    fs.writeFileSync(threadsFilePath, JSON.stringify(threads, null, 2));
}

function deleteThread(threadId) {
    const threads = readThreads();
    const updatedThreads = threads.filter(thread => thread.thread_id !== threadId);

    saveThreads(updatedThreads);
}


module.exports = { readThreads, saveThreads, saveThread, deleteThread };