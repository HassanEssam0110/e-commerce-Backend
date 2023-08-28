const express = require('express');
const { addProductToCart, getLoggedUserCart, removeProductFromCart, clearUserCart, updateCartItemQuantity, applyCoupon } = require('../controllers/cartController');
const authService = require('../services/authService')


const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'))

router.route('/')
    .get(getLoggedUserCart)
    .post(addProductToCart)
    .delete(clearUserCart)

router.route('/applyCoupon')
    .put(applyCoupon)

router.route('/:itemId')
    .put(updateCartItemQuantity)
    .delete(removeProductFromCart)



module.exports = router;