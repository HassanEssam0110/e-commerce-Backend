const express = require('express');
const { GetLoggedUserAddresses, addAddress, removeAddress } = require('../controllers/addressController');
const { addAddressValidator, removeAddressValidator } = require('../utils/validators/addressValidators')
const authService = require('../services/authService')

const router = express.Router()

router.use(authService.protect, authService.allowedTo('user'))

router.route('/')
    .get(GetLoggedUserAddresses)
    .post(addAddressValidator, addAddress)

router.route('/:addressId')
    .delete(removeAddressValidator, removeAddress)



module.exports = router;