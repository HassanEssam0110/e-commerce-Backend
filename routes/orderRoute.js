const express = require('express');
const { getAllOrders, getSpecificOrder, filterOrdersForLoggedUser, createCashOrder, updateOrderToPaid, updateOrderToDelivered, checkoutSession } = require('../controllers/orderController');
const authService = require('../services/authService');


const router = express.Router();

router.use(authService.protect);

router.route('/checkout-session/:cartId')
    .post(authService.allowedTo('user'), checkoutSession)

router.route('/')
    .get(authService.allowedTo('user', 'admin', 'manager'), filterOrdersForLoggedUser, getAllOrders)

router.route('/:id')
    .get(authService.allowedTo('user', 'admin', 'manager'), filterOrdersForLoggedUser, getSpecificOrder)

router.route('/:cartId')
    .post(authService.allowedTo('user'), createCashOrder)

router.route('/:id/paid')
    .put(authService.allowedTo('admin', 'manager'), updateOrderToPaid)
router.route('/:id/deliver')
    .put(authService.allowedTo('admin', 'manager'), updateOrderToDelivered)




module.exports = router;