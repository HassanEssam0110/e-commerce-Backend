const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const reviewModel = require('../../models/reviewModel');

exports.getBReviewValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid Review id format'),
    //middleware
    validatorMiddleware,
];

exports.createReviewValidator = [
    check('title')
        .optional(),
    check('rating')
        .notEmpty()
        .withMessage('Rating value required.')
        .isFloat({ min: 1, max: 5 })
        .withMessage('Rating value must be between 1 and 5.'),
    check('user')
        .isMongoId()
        .withMessage('Invalid User id format.'),
    check('product')
        .isMongoId()
        .withMessage('Invalid product id format.')
        .custom((val, { req }) =>
            // Check if logged user create review before
            reviewModel.findOne({ user: req.user._id, product: req.body.product }).then(
                (review) => {
                    if (review) {
                        return Promise.reject(
                            new Error('You already created a review before')
                        );
                    }
                }
            )
        ),
    validatorMiddleware
];




exports.updateReviewValidator = [
    //roles
    check('id')
        .isMongoId()
        .withMessage('Invalid Review id format')
        .custom((val, { req }) =>
            // check review ownership befare update
            reviewModel.findById(val).then(
                (review) => {
                    if (!review) {
                        return Promise.reject(new Error(`This is no review with id: '${val}'`));
                    }

                    if (review.user._id.toString() !== req.user._id.toString()) {
                        return Promise.reject(new Error('You are not allowed to edit this review'))
                    }
                }
            )
        ),
    check('rating')
        .optional()
        .isFloat({ min: 1, max: 5 })
        .withMessage('Rating value must be between 1 and 5.'),
    //middleware
    validatorMiddleware,
];


exports.deleteReviewValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid Review id format')
        .custom((val, { req }) => {
            // Check logged user role before
            if (req.user.role === 'user') {
                return reviewModel.findById(val)
                    .then((review) => {
                        if (!review) {
                            return Promise.reject(new Error(`This is no review with id: '${val}'`));
                        }

                        if (review.user._id.toString() !== req.user._id.toString()) {
                            return Promise.reject(new Error('You are not allowed to remove this review'))
                        }
                    })
            }
            return true;
        }),
    //middleware
    validatorMiddleware,
];
