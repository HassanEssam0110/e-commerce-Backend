const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware')
const CategoryModel = require('../models/categoryModel');


// use Middleware multer to uplaod single image
exports.uploadCategoryImage = uploadSingleImage('image');

//use  Middleware Image processing sharp to resize image and quality 
exports.resizeImage = asyncHandler(async (req, res, next) => {
    // const fileName = `category-${uuidv4()}-${Date.now()}.webp`
    // await sharp(req.file.buffer)
    //     .resize(600, 600)
    //     .toFormat('webp')
    //     .webp({ quality: 85 })
    //     .toFile(`uploads/categories/${fileName}`)
    const fileName = `category-${uuidv4()}-${Date.now()}.jpeg`
    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`uploads/categories/${fileName}`)

        //save image name in our DB
        req.body.image = fileName;
    }
    next();
})



//@desc    Get list of Categories
//@route   Get   /api/v1/categories
//@access  Public
exports.getCategories = factory.getAll(CategoryModel);

//@desc    Get specitic Category by id
//@route   Get   /api/v1/categories/:id
//@access  Public
exports.getCategory = factory.getOne(CategoryModel)


//@desc    Create new category
//@route   POST   /api/v1/categories
//@access  Private/admin-manager
exports.createCategory = factory.createOne(CategoryModel);



//@desc    Update specitic Category
//@route   PUT   /api/v1/categories/:id
//@access  Private/admin-manager
exports.updateCategory = factory.updateOne(CategoryModel)


//@desc    Delete specitic Category
//@route   DELETE   /api/v1/categories/:id
//@access  Private/admin only
exports.deleteCategory = factory.deleteOne(CategoryModel);