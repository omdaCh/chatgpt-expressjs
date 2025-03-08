const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MongoDB URI is missing. Check your .env file.");
    process.exit(1);
}

// Add connection options
const options = {
    serverSelectionTimeoutMS: 15000, // Increase from default 10000
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  };
  
  
mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error (event):", err);
});

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected!");
});

module.exports = mongoose;
