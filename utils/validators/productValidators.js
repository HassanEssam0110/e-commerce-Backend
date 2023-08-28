const { check } = require('express-validator');
const slugify = require('slugify');
const CategoryModel = require('../../models/categoryModel')
const subCategoryModel = require('../../models/subCategoryModel')
const validatorMiddleware = require('../../middlewares/validatorMiddleware');

exports.getProductValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid Product Id format'),
    //middleware
    validatorMiddleware,
];


exports.createProductValidator = [
    check('title')
        .notEmpty()
        .withMessage('Product title is required')
        .isLength({ min: 3 })
        .withMessage('title must be at least 3 characters')
        .isLength({ max: 100 })
        .withMessage('Max:100 ,Too long title characters')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check('description')
        .notEmpty()
        .withMessage('Product descriotion is required')
        .isLength({ min: 20 })
        .withMessage('Too short description characters')
        .isLength({ max: 2000 })
        .withMessage('Max:2000 ,Too long description characters'),
    check('quantity')
        .notEmpty()
        .withMessage('Product quantity is required')
        .isNumeric()
        .withMessage('Product quantity must be a number'),
    check('sold')
        .optional()
        .isNumeric()
        .withMessage('Product sold must be a number'),
    check('price')
        .notEmpty()
        .withMessage('Product price is required')
        .isNumeric()
        .withMessage('Product price must be a number')
        .isLength({ max: 200000 })
        .withMessage('To long price'),
    check('priceAfterDiscount')
        .optional()
        .isNumeric()
        .withMessage('Product price After Discount must be a number')
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.price <= value) {
                throw new Error('Price After Discount must be  lower than preice');
            }
            return true;
        }),
    check('colors')
        .optional()
        .isArray()
        .withMessage('available Colors should be array of string'),
    check('imageCover')
        .notEmpty()
        .withMessage('Product image cover is required'),
    check('images')
        .optional()
        .isArray()
        .withMessage('images should be array of string'),
    check('category')
        .notEmpty()
        .withMessage('Product must be belong to the category')
        .isMongoId()
        .withMessage('Invalid category Id format')
        .custom((categoryId) =>
            CategoryModel.findById(categoryId).then((categoryFounded) => {
                if (!categoryFounded) {
                    return Promise.reject(
                        new Error(`No category for this id: ${categoryId}`)
                    );
                }
            })
        )
    ,
    check('subcategories')
        .optional()
        .isMongoId()
        .withMessage('Invalid subcategory Id format')
        //check if subcategoriesIds found in DB
        .custom((subcategoriesIds) =>
            subCategoryModel.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
                (result) => {
                    if (result.length < 1 || result.length !== subcategoriesIds.length) {
                        return Promise.reject(new Error(`Invalid subcategories Ids`));
                    }
                }
            )
        )
        //check if subcategoriesIds found in DB relate the same category
        .custom((val, { req }) =>
            subCategoryModel.find({ category: req.body.category }).then(
                (subcategories) => {
                    const subCategoriesIdsInDB = [];
                    subcategories.forEach((subCategory) => {
                        subCategoriesIdsInDB.push(subCategory._id.toString());
                    });

                    // check if subcategories ids in db include subcategories in req.body (true)
                    if (!val.every((v) => subCategoriesIdsInDB.includes(v))) {
                        return Promise.reject(
                            new Error(`subcategories not belong to same category`)
                        );
                    }
                }
            )
        )
    ,
    check('brand')
        .optional()
        .isMongoId()
        .withMessage('Invalid brand Id format'),
    check('ratingsAverage')
        .optional()
        .isNumeric()
        .withMessage('ratingsAverage must be a number')
        .isLength({ min: 1 })
        .withMessage('Rating must be above or equal 1.0')
        .isLength({ max: 5 })
        .withMessage('Rating must be below or equal 5.0'),
    check('ratingsQuantity')
        .optional()
        .isNumeric()
        .withMessage('ratingsQuantity must be a number')
    ,
    validatorMiddleware
];


exports.updateProductValidator = [
    //roles
    check('id')
        .isMongoId()
        .withMessage('Invalid Product Id format'),
    check('title')
        .optional()
        .isLength({ min: 3 })
        .withMessage('title must be at least 3 characters')
        .isLength({ max: 100 })
        .withMessage('Max:100 ,Too long title characters')
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check('description')
        .optional()
        .isLength({ min: 20 })
        .withMessage('Too short description characters')
        .isLength({ max: 2000 })
        .withMessage('Max:2000 ,Too long description characters'),
    check('quantity')
        .optional()
        .isNumeric()
        .withMessage('Product quantity must be a number'),
    check('sold')
        .optional()
        .isNumeric()
        .withMessage('Product sold must be a number'),
    check('price')
        .optional()
        .isNumeric()
        .withMessage('Product price must be a number')
        .isLength({ max: 200000 })
        .withMessage('To long price'),
    check('priceAfterDiscount')
        .optional()
        .isNumeric()
        .withMessage('Product price After Discount must be a number')
        .toFloat()
        .custom((value, { req }) => {
            if (req.body.price <= value) {
                throw new Error('Price After Discount must be lower than price');
            }
            return true;
        }),
    check('colors')
        .optional()
        .isArray()
        .withMessage('available Colors should be array of string'),
    check('imageCover')
        .optional(),
    check('images')
        .optional()
        .isArray()
        .withMessage('images should be array of string'),
    check('category')
        .optional()
        .isMongoId()
        .withMessage('Invalid category Id format')
        .custom((categoryId) =>
            CategoryModel.findById(categoryId).then((categoryFounded) => {
                if (!categoryFounded) {
                    return Promise.reject(
                        new Error(`No category for this id: ${categoryId}`)
                    );
                }
            })
        )
    ,
    check('subcategories')
        .optional()
        .isMongoId()
        .withMessage('Invalid subcategory Id format')
        //check if subcategoriesIds found in DB
        .custom((subcategoriesIds) =>
            subCategoryModel.find({ _id: { $exists: true, $in: subcategoriesIds } }).then(
                (result) => {
                    if (result.length < 1 || result.length !== subcategoriesIds.length) {
                        return Promise.reject(new Error(`Invalid subcategories Ids`));
                    }
                }
            )
        )
        //check if subcategoriesIds found in DB relate the same category
        .custom((val, { req }) =>
            subCategoryModel.find({ category: req.body.category }).then(
                (subcategories) => {
                    const subCategoriesIdsInDB = [];
                    subcategories.forEach((subCategory) => {
                        subCategoriesIdsInDB.push(subCategory._id.toString());
                    });

                    // check if subcategories ids in db include subcategories in req.body (true)
                    if (!val.every((v) => subCategoriesIdsInDB.includes(v))) {
                        return Promise.reject(
                            new Error(`subcategories not belong to same category`)
                        );
                    }
                }
            )
        ),
    check('brand')
        .optional()
        .isMongoId()
        .withMessage('Invalid brand Id format'),
    //middleware
    validatorMiddleware,
];


exports.deleteProductValidator = [
    //roles
    check('id')
        .isMongoId()
        .withMessage('Invalid Product Id format'),
    //middleware
    validatorMiddleware,
];
