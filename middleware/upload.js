const multer = require("multer");
const { storage } = require("./cloudinary"); // <-- this is from your cloudinary.js
const path = require("path");

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images (JPEG, PNG, GIF, pdf) are allowed"));
    }
};

const upload = multer({
    storage: storage, // ✅ Using Cloudinary Storage
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
