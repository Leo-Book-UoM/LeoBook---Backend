const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dflqhubmu',
    api_key: '822243466486761',
    api_secret: 'hKvgkllysey5hSDcNtgKeqUKkI4',
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'leobook_uploads',
        allowed_formats: ['jpeg', 'png', 'jpg', 'gif'],
    },
});

module.exports = {
    cloudinary,
    storage
};
