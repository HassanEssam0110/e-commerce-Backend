const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const productModel = require('../../models/productModel');



exports.addProductToWishlistValidator = [
    check('productId')
        .notEmpty()
        .isMongoId()
        .withMessage('Invalid Product id format')
        .custom((val, { req }) => productModel.findById(req.body.productId).then((product) => {
            if (!product) {
                return Promise.reject(new Error('There is no product in this ID'));
            }
        })),


    validatorMiddleware
];

exports.removeProductfromWishlistValidator = [
    check('producId')
        .notEmpty()
        .isMongoId()
        .withMessage('Invalid Product id format')
    // .custom((val, { req }) => productModel.findById(req.user._id).then((product) => {
    //     if (!product) {
    //         return Promise.reject(new Error('There is no product in this ID'));
    //     }
    // })),

    ,
    validatorMiddleware
];