const multer = require('multer');
const ApiError = require('../utils/ApiError');


// upload single file image
exports.uploadSingleImage = (fieldName) => {
    // 1- Disk Storage engine if not need to make change in file with upload
    /*
    const multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/categories');
        },
        filename: function (req, file, cb) {
            // format file name ==> category-${id}-Date.now().jpg
            const ext = file.mimetype.split('/')[1];
            const fileName = `category-${uuidv4()}-${Date.now()}.${ext}`
            cb(null, fileName)
        }
    })
    */

    // 2- Memory Storage engine if  need to make change in file with upload resize 
    const multerStorage = multer.memoryStorage();

    // filter to acepted images only
    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new ApiError('Only Images Allowed', 400), false);
        }
    }

    const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

    return upload.single(fieldName);
}


// upload Multiple images 
exports.uploadMixOfImages = (arrayOfFields) => {

    // 2- Memory Storage engine if  need to make change in file with upload resize 
    const multerStorage = multer.memoryStorage();

    // filter to acepted images only
    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new ApiError('Only Images Allowed', 400), false);
        }
    }

    const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

    return upload.fields(arrayOfFields);

}