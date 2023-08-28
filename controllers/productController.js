const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory')
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware')
const ProductModel = require('../models/productModel');




// use Middleware multer to uplaod Multe images
exports.uploadProductImages = uploadMixOfImages([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);


//use  Middleware Image processing sharp to resize image and quality 
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
    // 1-processimg image cover
    if (req.files.imageCover) {
        const imageCoverfileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`uploads/products/${imageCoverfileName}`)
        //save image name in our DB
        req.body.imageCover = imageCoverfileName;
    }

    // 2-processimg image of images
    if (req.files.images) {
        req.body.images = [];
        await Promise.all(req.files.images.map(async (img, index) => {
            const imagefileName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`
            await sharp(img.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`uploads/products/${imagefileName}`)
            //save image name in our DB
            req.body.images.push(imagefileName);
        }))
    }

    next();
});


//@desc    Get list of Products
//@route   Get   /api/v1/Products
//@access  Public
exports.getProducts = factory.getAll(ProductModel, 'Products')

//@desc    Get specitic Product by id
//@route   Get   /api/v1/Products/:id
//@access  Public
exports.getProduct = factory.getOne(ProductModel, 'reviews')


//@desc    Create new Product
//@route   POST   /api/v1/products
//@access  Private/admin-manager
exports.createProduct = factory.createOne(ProductModel)



//@desc    Update specitic Product
//@route   PUT   /api/v1/products/:id
//@access  Private/admin-manager
exports.updateProduct = factory.updateOne(ProductModel);


//@desc    Delete specitic Product
//@route   DELETE   /api/v1/Products/:id
//@access  Private/admin
exports.deleteProduct = factory.deleteOne(ProductModel);
