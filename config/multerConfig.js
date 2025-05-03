
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        // Extract student name and ID from the request
        const { studentName, studentId } = req.body;
        // Construct the filename based on file type
        let filename;
        if (file.mimetype.startsWith('image/')) {
            // If it's an image, use student name and ID
            filename = `${studentName}_${studentId}${path.extname(file.originalname)}`;
        } else {
            // If it's not an image (e.g., PDF), use default naming
            filename = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
        }
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB file size limit
    fileFilter: function(req, file, cb){
        // Allow PDFs and images (jpeg, jpg, png)
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'image/jpeg' || 
            file.mimetype === 'image/jpg' || 
            file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs and images (jpeg, jpg, png) are allowed!'), false);
        }
    }
});

module.exports = upload;
