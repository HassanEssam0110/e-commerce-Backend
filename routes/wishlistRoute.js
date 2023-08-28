const express = require('express');
const { addProductToWishlist, removeProductFromWishlist, GetLoggedUserWishlist } = require('../controllers/wishlistController')
const { addProductToWishlistValidator, removeProductfromWishlistValidator } = require('../utils/validators/wishlistValidators')
const authService = require('../services/authService')

const router = express.Router()

router.use(authService.protect, authService.allowedTo('user'))

router.route('/')
    .get(GetLoggedUserWishlist)
    .post(addProductToWishlistValidator, addProductToWishlist)

router.route('/:productId')
    .delete(removeProductfromWishlistValidator, removeProductFromWishlist)



module.exports = router;