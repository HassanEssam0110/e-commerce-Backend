const { check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const UserModel = require('../../models/userModel');


exports.SignUpValidator = [
    check('name')
        .notEmpty()
        .withMessage('User name is required')
        .isLength({ min: 3 })
        .withMessage('TOO short User name')
        .isLength({ max: 50 })
        .withMessage('TOO long User name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
            UserModel.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('E-mail already in user'));
                }
            })
        ),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .custom((password, { req }) => {
            if (password !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
            return true;
        }),

    check('passwordConfirm')
        .notEmpty()
        .withMessage('Password confirm is required'),

    validatorMiddleware
];


exports.LoginValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),

    check('password')
        .notEmpty()
        .withMessage('Password required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    validatorMiddleware
];

exports.ActivateUserValidator = [
    check('email')
        .notEmpty()
        .withMessage('Email required')
        .isEmail()
        .withMessage('Invalid email address'),
    validatorMiddleware
];






