const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');


exports.getCouponValidator = [
    check('id').isMongoId().withMessage('Invalid coupon id format'),
    validatorMiddleware
];


exports.addCouponValidator = [
    check('name')
        .notEmpty()
        .withMessage('Coupon Name is required.')
        .customSanitizer((val) => val.toUpperCase()),// Use customSanitizer to convert name to uppercase
    check('expires')
        .notEmpty()
        .withMessage('Coupon expire Date is required.'),
    // .isDate()
    // .withMessage('Coupon expire Date must be date.'),
    check('discount')
        .isNumeric()
        .withMessage('Coupon discount must be a number.')

    , validatorMiddleware
];


exports.updateCouponValidator = [
    check('name')
        .optional()
        .customSanitizer((val) => val.toUpperCase()),// Use customSanitizer to convert name to uppercase
    check('expires')
        .optional(),
    // .isDate()
    // .withMessage('Coupon expire Date must be date.'),
    check('discount')
        .optional()
        .isNumeric()
        .withMessage('Coupon discount must be a number.')

    , validatorMiddleware
];

exports.removeCouponValidator = [
    check('id').isMongoId().withMessage('Invalid coupon id format'),

    validatorMiddleware
];