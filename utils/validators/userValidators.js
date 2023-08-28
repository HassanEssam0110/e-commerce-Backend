const bcrypt = require('bcrypt');
const { check } = require('express-validator');
const slugify = require('slugify');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const UserModel = require('../../models/userModel');


exports.getUserValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid User id format'),
    //middleware
    validatorMiddleware,
];


exports.createUserValidator = [
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

    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])//validation egypt-sudia
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),
    check('profileImg')
        .optional(),
    check('role')
        .optional(),
    validatorMiddleware
];


exports.updateUserValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid User id format'),
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('TOO short User name')
        .isLength({ max: 50 })
        .withMessage('TOO long User name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
            UserModel.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('E-mail already in user'));
                }
            })
        ),

    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])//validation egypt-sudia
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),
    check('profileImg')
        .optional(),
    check('role')
        .optional(),
    //middleware
    validatorMiddleware,
];

exports.updateUserPasswordValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    check('currentPassword')
        .notEmpty()
        .withMessage('You must enter your current password'),
    check('passwordConfirm')
        .notEmpty()
        .withMessage('You must enter your password confirm'),
    check('password')
        .notEmpty()
        .withMessage('You must enter your new password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .custom(async (val, { req }) => {
            // 1) verfiy current password
            const user = await UserModel.findById(req.params.id);
            if (!user) {
                throw new Error('There is no user with this id');
            }
            const isCorrectPass = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isCorrectPass) {
                throw new Error('Incorrect current password');
            }

            // 2)verify password confirm
            if (val !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
        }),
    //middleware
    validatorMiddleware,
];

exports.deleteUserValidator = [
    //roles
    check('id').isMongoId().withMessage('Invalid Brand id format'),
    //middleware
    validatorMiddleware,
];


exports.updateLoggedUserPasswordValidator = [
    check('currentPassword')
        .notEmpty()
        .withMessage('You must enter your current password'),
    check('passwordConfirm')
        .notEmpty()
        .withMessage('You must enter your password confirm'),
    check('password')
        .notEmpty()
        .withMessage('You must enter your new password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .custom(async (val, { req }) => {
            // 1) verfiy current password
            const user = await UserModel.findById(req.user._id);
            if (!user) {
                throw new Error('There is no user with this id');
            }
            const isCorrectPass = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isCorrectPass) {
                throw new Error('Incorrect current password');
            }

            // 2)verify password confirm
            if (val !== req.body.passwordConfirm) {
                throw new Error('Password Confirmation incorrect');
            }
        }),
    //middleware
    validatorMiddleware,
];

exports.updateLoggedUserValidator = [
    //roles
    check('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('TOO short User name')
        .isLength({ max: 50 })
        .withMessage('TOO long User name')
        .custom((val, { req }) => {
            req.body.slug = slugify(val)
            return true;
        }),
    check('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email address')
        .custom((val) =>
            UserModel.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error('E-mail already in user'));
                }
            })
        ),
    check('phone')
        .optional()
        .isMobilePhone(['ar-EG', 'ar-SA'])//validation egypt-sudia
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),
    check('profileImg')
        .optional(),
    //middleware
    validatorMiddleware,
];