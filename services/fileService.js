
const { OpenAI } = require("openai");
require('dotenv').config();
const apiKey = process.env.API_KEY;
const openai = new OpenAI({ apiKey: apiKey });
const fs = require('fs');

exports.createFile = async (filePath, purpose) => {
    try {
        const file = await openai.files.create({
            file: fs.createReadStream(filePath),
            purpose: purpose,
        });

        return file;
    } catch (error) {
        console.error('Error uploading file to OpenAI:', error);
        throw error;
    }
};


exports.deleteFile = () => {

}

exports.getFile = async (file_id) => {
    const fileObject = await openai.files.retrieve(file_id);
    return fileObject;
}



exports.deleteTempFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error deleting temporary file:', error);
    }
};