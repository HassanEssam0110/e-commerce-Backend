const { check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getCategoryValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid category id format'),
    //middleware
    validatorMiddleware,
];


exports.createCategoryValidator = [
    check('name')
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3 })
        .withMessage('TOO short category name')
        .isLength({ max: 30 })
        .withMessage('TOO long category name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    validatorMiddleware
];


exports.updateCategoryValidator = [
    //roles
    check('id')
        .isMongoId()
        .withMessage('Invalid category id format'),
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('TOO short category name')
        .isLength({ max: 30 })
        .withMessage('TOO long category name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    //middleware
    validatorMiddleware,
];


exports.deleteCategoryValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid category id format'),
    //middleware
    validatorMiddleware,
];
