const fileService = require('../services/fileService');
const multer = require('multer');

// Configure Multer to store files with original names
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store in 'uploads/' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Keep original filename
    }
});

const upload = multer({ storage: storage }).single('file');


exports.createFile = async (req, res) => {

    try {

        // Handle file upload using multer
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: 'File upload failed', details: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const filePath = req.file.path;
            const purpose = req.body.purpose || 'assistants'; 

            const file = await fileService.createFile(filePath, purpose);

            fileService.deleteTempFile(filePath);

            // Send the OpenAI file object as the response
            res.status(200).json({ message: 'File uploaded successfully', file });
        });
    } catch (error) {
        console.error('Error in uploadFile controller:', error);
        res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
};

exports.getFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        if (!fileId) {
            return res.status(400).json({ error: 'File ID is required' });
        }

        const fileObject = await fileService.getFile(fileId);
        if (!fileObject) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.status(200).json(fileObject);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ error: 'File not found in Open AI' });
        }
        console.error('Error retrieving file:', err); // Log for debugging
        res.status(500).json({ 
            error: 'Error retrieving file', 
            details: err.message 
        });
    }
};