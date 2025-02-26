const fileService = require('../services/fileService');
const multer = require('multer');


// Configure multer to store files in a temporary directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure the 'uploads' directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ dest: 'uploads/' });

exports.createFile = async (req, res) => {
    try {

        let totalSize = req.headers['content-length'];
        let uploadedSize = 0;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        req.on('data', (chunk) => {
            uploadedSize += chunk.length;
            const progress = Math.round((uploadedSize / totalSize) * 100);
            console.log(`Upload Progress: ${progress}%`);
            res.write(`data: ${JSON.stringify({ progress })}\n\n`);
        });

        upload.single('file')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: 'File upload failed', details: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const filePath = req.file.path;
            const purpose = req.body.purpose || 'assistants'; // Default purpose

            // Upload the file to OpenAI
            const file =  null
            // await fileService.createFile(filePath, purpose);

            // Delete the temporary file after upload
            // fileService.deleteTempFile(filePath);

            // res.status(200).json({ message: 'File uploaded successfully', file });
        });
    } catch (error) {
        console.error('Error in createFile:', error);
        res.status(500).json({ error: 'Failed to upload file', details: error.message });
    }
};


// exports.createFile = async (req, res) => {
//     try {

//         let totalSize = req.headers['content-length'];;
//         let uploadedSize = 0;

//         req.on('data', (chunk) => {
//             uploadedSize += chunk.length;
//             const progress = Math.round((uploadedSize / totalSize) * 100);
//             console.log(`Upload Progress: ${progress}%`);
//         });


//         upload(req, res, async (err) => {
//             if (err) {
//                 return res.status(400).json({ error: 'File upload failed', details: err.message });
//             }

//             if (!req.file) {
//                 return res.status(400).json({ error: 'No file uploaded' });
//             }

//             const filePath = req.file.path;
//             const purpose = req.body.purpose || 'assistants'; // Default purpose

//             // Upload the file to OpenAI
//             const file = await fileService.createFile(filePath, purpose);

//             // Delete the temporary file after upload
//             fileService.deleteTempFile(filePath);

//             res.status(200).json({ message: 'File uploaded successfully', file });
//         });
//     } catch (error) {
//         console.error('Error in createFile:', error);
//         res.status(500).json({ error: 'Failed to upload file', details: error.message });
//     }
// };