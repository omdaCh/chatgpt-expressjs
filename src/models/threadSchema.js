const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
    thread_id: { type: String, required: true },
    created_at: { type: Number, required: true },
    title: { type: String, required: true }
});

const MngThread = mongoose.model('Thread', ThreadSchema); 

module.exports = MngThread;