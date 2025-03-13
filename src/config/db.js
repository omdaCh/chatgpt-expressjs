const mongoose = require("mongoose");
require("dotenv").config();

console.log('Regular db.js');

const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;

    console.log('calling connectDB on Regular db.js');

    if (!MONGODB_URI) {
        console.error("MongoDB URI is missing. Check your .env file.");
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => {
            console.error("MongoDB connection error: ", err);
            process.exit(1);
        });
}

const disconnectDB = async () => {

}



module.exports = { mongoose, connectDB,disconnectDB };
