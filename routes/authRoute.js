const express = require('express');
const { signUp, login, forgotpassword, verifyPassResetCode, resetPassword, activateUserAccount, verifyActivationCode, reactivateUserAccount } = require('../services/authService')
const { SignUpValidator, LoginValidator, ActivateUserValidator } = require('../utils/validators/authValidators');


const router = express.Router();


router.route('/signup')
    .post(SignUpValidator, signUp)

router.route('/login')
    .post(LoginValidator, login)

router.route('/forgotPassword')
    .post(forgotpassword)
router.route('/verifyResetCode')
    .post(verifyPassResetCode)
router.route('/resetPassword')
    .post(resetPassword)


router.route('/activateMe')
    .post(ActivateUserValidator, activateUserAccount)
router.route('/verifyActivationCode')
    .post(verifyActivationCode)
router.route('/reactivateUserAccount')
    .post(reactivateUserAccount)

module.exports = router;