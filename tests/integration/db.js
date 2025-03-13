const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
require("dotenv").config();

let mongoServer;
let MONGODB_URI;


const connectDB = async () => {


    if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
        MONGODB_URI = mongoServer.getUri();
    }

    if (!MONGODB_URI) {
        console.error("In-Memory MongoDB URI is missing. Check your .env file.");
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI)
        .then(() => console.log("In-Memory MongoDB connected"))
        .catch((err) => {
            console.error("In-Memory MongoDB connection error: ", err);
            process.exit(1);
        });



}

const disconnectDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop(); 
    }
    console.log("🚀 In-memory MongoDB stopped and cleaned up.");
};





module.exports = { mongoose, connectDB, disconnectDB };
