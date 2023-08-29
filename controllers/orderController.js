const dotenv = require('dotenv');
//configuration dotenv
dotenv.config({ path: "config.env" });
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

const factory = require('./handlersFactory')
const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');


// make filter MW 
exports.filterOrdersForLoggedUser = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'user') {
        req.filterObj = { user: req.user._id };
    }
    next();
})


// @desc      Get All Orders
// @route     GET /api/v1/orders
// @access    Private/Protect/user-admin-manager
exports.getAllOrders = factory.getAll(orderModel);

// @desc      Get Specific Order
// @route     GET /api/v1/orders
// @access    Private/Protect/user-admin-manager
exports.getSpecificOrder = factory.getOne(orderModel);



// @desc      Create Cash order
// @route     POST /api/v1/orders/cartId
// @access    Private/Protect/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {


    // app setting => make req to get values from admin
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get Cart depend on cartId.
    const cart = await cartModel.findById(req.params.cartId);

    if (!cart) {
        return next(new ApiError(`There is no such cart with id:'${req.params.cartId}'`, 404))
    }

    // 2) Get order price depend on cart price,"check if coupon apply".
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // 3) Create order with default paymentMethodType cash.
    const order = await orderModel.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        shippingAddress: req.body.shippingAddress,
        // taxPrice: taxPrice,
        // shippingPrice: shippingPrice,
        totalOrderPrice,
    })


    // 4) After creating order, decrement product quantity,increment product sold.
    if (order) {

        const bulkOption = cart.cartItems.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } }
            }
        }));

        await productModel.bulkWrite(bulkOption, {}) // bulkWrite to make multi operations to the MongoDB server in one command.

        // 5) clear cart depend on cartId.
        await cartModel.findByIdAndDelete(req.params.cartId);
    }


    res.status(201).json({ status: 'success', data: order });
})


// @desc      Update Order to paid
// @route     PUT /api/v1/orders/:id/paid
// @access    Private/Protect/admin-manger
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ApiError(`There is no sush a Order with this id:${req.params.id}`, 404))
    }

    //Update order to paid
    order.isPaid = true;
    order.paidAt = Date.now();

    const updateOrder = await order.save();
    res.status(200).json({ status: 'success', data: updateOrder })
})



// @desc      Update Order to delivered status
// @route     PUT /api/v1/orders/:id/deliver
// @access    Private/Protect/admin-manger
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
        return next(new ApiError(`There is no sush a Order with this id:${req.params.id}`, 404))
    }

    //Update order to paid
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updateOrder = await order.save();
    res.status(200).json({ status: 'success', data: updateOrder })
})



// --------------- payment ---------------


//@desc      Create checkout session from stripe and send it as response
//@route     POST  /api/v1/orders/checkout-session/:cartId
// @access   Private/Protect/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
    // app setting => make req to get values from admin
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get cart depend on cartId
    const cart = await cartModel.findById(req.params.cartId).populate({ path: 'cartItems.product', select: 'title' })

    if (!cart) {
        return next(new ApiError(`There is no such cart with id:'${req.params.cartId}'`, 404))
    }

    // 2) Get order price depend on cart price,"check if coupon apply".
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // 3) Create stripe checkout session
    const cartProducts = cart.cartItems.map(item => item.product.title).join('+ ');
    const orderDescription = `Order for: ${cartProducts}`;
    const userName = req.user.name; // Assuming the user's name is stored in req.user.name

    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                currency: 'egp',
                unit_amount: totalOrderPrice * 100,  // Provide the price in the smallest currency unit
                product_data: {
                    name: `(${userName})`, // Include user's name in product name
                    description: orderDescription,
                    // images: ['https://example.com/t-shirt.png'],
                },
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/api/v1/orders`,
        cancel_url: `${req.protocol}://${req.get('host')}/api/v1/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
    });

    //4) send session to response
    res.status(200).json({ status: 'success', session })
});



exports.webhockCheckout = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        console.log('Create Order HERE');
        console.log()
    }
})