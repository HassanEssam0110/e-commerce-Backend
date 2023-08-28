const { check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getBrandValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid Brand id format'),
    //middleware
    validatorMiddleware,
];


exports.createBrandValidator = [
    check('name')
        .notEmpty()
        .withMessage('Brand name is required')
        .isLength({ min: 3 })
        .withMessage('TOO short Brand name')
        .isLength({ max: 30 })
        .withMessage('TOO long Brand name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    validatorMiddleware
];


exports.updateBrandValidator = [
    //roles
    check('id')
        .isMongoId()
        .withMessage('Invalid Brand id format'),
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('TOO short Brand name')
        .isLength({ max: 30 })
        .withMessage('TOO long Brand name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    //middleware
    validatorMiddleware,
];


exports.deleteBrandValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid Brand id format'),
    //middleware
    validatorMiddleware,
];
