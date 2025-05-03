const multer = require('multer');
const path = require('path');


// Define disk storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Naming the file with current date-time to avoid name conflicts
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

// Define file filter function
const fileFilter = (req, file, cb) => {
    // Accept PDFs and images (jpeg, jpg, png)
    if (
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/png'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Create upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Create upload image middleware
const uploadimage = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB file size limit
    fileFilter: fileFilter
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'identityImage', maxCount: 1 }
]);

// Export the middleware functions
module.exports = {
    storage,
    fileFilter,
    upload,
    uploadimage
};
