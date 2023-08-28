const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware')
const BrandModel = require('../models/brandModel');


// use Middleware multer to uplaod single image
exports.uploadBrandImage = uploadSingleImage('image');

//use  Middleware Image processing sharp to resize image and quality 
exports.resizeImage = asyncHandler(async (req, res, next) => {
    // const fileName = `brand-${uuidv4()}-${Date.now()}.webp`
    // await sharp(req.file.buffer)
    //     .resize(600, 600)
    //     .toFormat('webp')
    //     .webp({ quality: 85 })
    //     .toFile(`uploads/brands/${fileName}`)
    const fileName = `brand-${uuidv4()}-${Date.now()}.jpeg`
    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`uploads/brands/${fileName}`)

        //save image name in our DB
        req.body.image = fileName;
    }
    next();
})



//@desc    Get list of Brands
//@route   Get   /api/v1/brands
//@access  Public
exports.getBrands = factory.getAll(BrandModel);

//@desc    Get specific Brand by id
//@route   Get   /api/v1/brands/:id
//@access  Public
exports.getBrand = factory.getOne(BrandModel);


//@desc    Create new Brand
//@route   POST   /api/v1/brands
//@access  Private/admin-manager
exports.createBrand = factory.createOne(BrandModel);



//@desc    Update specific Brand
//@route   PUT   /api/v1/brands/:id
//@access  Private/admin-manager
exports.updateBrand = factory.updateOne(BrandModel);


//@desc    Delete specific Brand
//@route   DELETE   /api/v1/brands/:id
//@access  Private/admin only
exports.deleteBrand = factory.deleteOne(BrandModel);