const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const userModel = require('../../models/userModel');



exports.addAddressValidator = [
    check('alias')
        .notEmpty()
        .withMessage('Alias name is required and unique.')
        .custom((val, { req }) => userModel.findById(req.user._id).then((user) => {
            if (user.addresses.find(address => address.alias === req.body.alias)) {
                return Promise.reject(new Error(`Title: '${val}' is already registered`));
            }
        })),
    check('details')
        .notEmpty()
        .withMessage('Details is required.'),
    check('phone')
        .notEmpty()
        .isMobilePhone(['ar-EG', 'ar-SA'])//validation egypt-sudia
        .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),
    check('city')
        .notEmpty()
        .withMessage('City is required.'),
    check('postalCode')
        .notEmpty()
        .withMessage('postalCode is required.')
        .isPostalCode('any')
        .withMessage('Invalid postalCode number')


    , validatorMiddleware
];

exports.removeAddressValidator = [
    check('id').isMongoId().withMessage('Invalid address id format'),
    validatorMiddleware
];
