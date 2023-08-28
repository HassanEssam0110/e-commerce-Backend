const { check } = require('express-validator');
const slugify = require('slugify')
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const CategoryModel = require('../../models/categoryModel')


exports.getSubCategoryValidator = [
    //roles
    check('id')
        .isMongoId()
        .withMessage('Invalid SubCategory id format'),
    //middleware
    validatorMiddleware,
];


exports.createSubCategoryValidator = [
    check('name')
        .notEmpty()
        .withMessage(' SubCategory name is required')
        .isLength({ min: 2 })
        .withMessage('TOO short Subcategory name')
        .isLength({ max: 32 })
        .withMessage('TOO long Subcategory name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check('category')
        .notEmpty()
        .withMessage('SubCategory must be belong to Category')
        .isMongoId()
        .withMessage('Invalid Category id format')
        .custom((categoryId) =>
            CategoryModel.findById(categoryId).then((categoryFounded) => {
                if (!categoryFounded) {
                    return Promise.reject(
                        new Error(`No Category found for this id: ${categoryId}`)
                    );
                }
            })
        ),
    validatorMiddleware
];


exports.updateSubCategoryValidator = [
    //roles
    check('id')
        .notEmpty()
        .withMessage(' SubCategory id is required')
        .isMongoId()
        .withMessage('Invalid Subcategory id format'),
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('TOO short Subcategory name')
        .isLength({ max: 32 })
        .withMessage('TOO long Subcategory name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check('category')
        .optional() // Make the category field optional
        .if((value, { req }) => req.body.category) // Only validate if category is provided
        .isMongoId()
        .withMessage('Invalid Category id format')
        .custom((categoryId) =>
            CategoryModel.findById(categoryId).then((categoryFounded) => {
                if (!categoryFounded) {
                    return Promise.reject(
                        new Error(`No Category found for this id: ${categoryId}`)
                    );
                }
            })
        ),
    //middleware
    validatorMiddleware,
];


exports.deleteSubCategoryValidator = [
    //roles
    check('id')
        .notEmpty()
        .withMessage(' SubCategory id is required')
        .isMongoId()
        .withMessage('Invalid Subcategory id format'),
    //middleware
    validatorMiddleware,
];
